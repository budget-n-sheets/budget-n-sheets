function daily_PostEvents_(date) {
	var calendar, listEventos, listIds, evento;
	var sheet, lastRow;
	var data, data_Cards;
	var number_accounts, mm, dd, value, tags;
	var i, j, k;

	var dec_p = PropertiesService.getDocumentProperties().getProperty("decimal_separator");

	if (!dec_p) dec_p = "] [";

	mm = date.getMonth();
	dd = date.getDate();

	sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MN_SHORT_[mm]);
	if (!sheet) return;
	if (sheet.getMaxRows() < 4) return;

	calendar = getUserSettings_("FinancialCalendar");
	if (calendar === "") return;
	calendar = optCalendar_GetCalendarFromSHA1_(calendar);
	if (!calendar) return;

	listEventos = calendar.getEventsForDay(date);
	if (listEventos.length === 0) return;
	listEventos = optCalendar_ProcessRawEvents_(listEventos);

	number_accounts = getUserConstSettings_('number_accounts');

	data = [ ];
	data_Cards = [ ];
	listIds = [ ];

	for (k = 0; k < 1 + number_accounts; k++) {
		data.push([ ]);
	}

	for (i = 0; i < listEventos.length; i++) {
		evento = listEventos[i];

		if (evento.Description === "") continue;
		if (evento.hasAtIgn) continue;

		if (evento.Table !== -1) k = evento.Table;
		else if (evento.Card !== -1) k = evento.Card;
		else continue;

		if ( !isNaN(evento.Value) ) value = (evento.Value).formatLocaleSignal(dec_p);
		else if (evento.Tags.length > 0) value = 0;
		else continue;

		tags = "";
		for (j = 0; j < evento.Tags.length; j++) {
			tags += "#" + evento.Tags[j] + " ";
		}

		if (typeof k === "number") {
			data[k].push([ dd, evento.Title, value, tags ]);
		} else if (!evento.hasQcc) {
			data_Cards.push([ dd, evento.Title, k, value, tags ]);
		}

		listIds.push(evento.Id);
	}

	lastRow = sheet.getLastRow() + 1;
	for (k = 0; k < 1 + number_accounts; k++) {
		if (data[k].length === 0) continue;

		sheet.getRange(
				lastRow, 1 + 5*k,
				data[k].length, 4)
			.setValues(data[k]);
	}

	if (data_Cards.length > 0) {
		sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Cards");
		if (!sheet) return;

		lastRow = sheet.getLastRow() + 1;
		if (lastRow < 6) return;

		sheet.getRange(
				lastRow, 1 + 6*mm,
				data_Cards.length, 5)
			.setValues(data_Cards);
	}

	calendarMuteEvents_(calendar, listIds);
}


function update_DecimalSepartor_() {
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var sheet = spreadsheet.getSheetByName("_Settings");
	var cell;

	if (!sheet) return;

	cell = sheet.getRange(8, 2);

	cell.setValue(0.1);
	cell.setNumberFormat("0.0");
	SpreadsheetApp.flush();

	cell = cell.getDisplayValue();
	if ( /\./.test(cell) ) {
		setPropertiesService_("document", "", "decimal_separator", "[ ]");
	} else {
		deletePropertiesService_("document", "decimal_separator");
	}

	setUserSettings_("SpreadsheetLocale", spreadsheet.getSpreadsheetLocale());
	return true;
}



function monthly_TreatLayout_(yyyy, mm) {
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet(),
			sheetTags = spreadsheet.getSheetByName('Tags');
	var financial_year = getUserConstSettings_('financial_year');
	var md, a, i;

	if (financial_year > yyyy) return; // Too soon to format the spreadsheet.
	else if (financial_year < yyyy) mm = 0; // Last time to format the spreadsheet.

	if (mm === 0) {
		if (yyyy === financial_year) {
			for (i = 0; i < 4; i++) {
				spreadsheet.getSheetByName(MN_SHORT_[i]).showSheet();
			}
			for (; i < 12; i++) {
				spreadsheet.getSheetByName(MN_SHORT_[i]).hideSheet();
			}
			return;
		} else {
			for (i = 0; i < 12; i++) {
				spreadsheet.getSheetByName(MN_SHORT_[i]).showSheet();
			}

			a = 11;
		}
	} else {
		md = getMonthDelta(mm);

		for (i = 0; i < 12; i++) {
			if (i < mm + md[0] || i > mm + md[1]) {
				spreadsheet.getSheetByName(MN_SHORT_[i]).hideSheet();
			} else {
				spreadsheet.getSheetByName(MN_SHORT_[i]).showSheet();
			}
		}

		a = mm - 1;
	}

	foo_ColorTabs_();
	foo_FormatAccounts_(a);
	foo_FormatCards_(a);
}



function foo_ColorTabs_() {
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var financial_year = getUserConstSettings_('financial_year'),
			init_month = getUserSettings_('InitialMonth');
	var date = getSpreadsheetDate();
	var mm, md, i;

	for (i = 0; i < init_month; i++) {
		spreadsheet.getSheetByName(MN_SHORT_[i]).setTabColor('#b7b7b7');
	}

	if (financial_year === date.getFullYear()) {
		mm = date.getMonth();
		md = getMonthDelta(mm);

		for (; i < 12; i++) {
			if (i < mm + md[0] || i > mm + md[1]) {
				spreadsheet.getSheetByName(MN_SHORT_[i]).setTabColor('#a4c2f4');
			} else {
				spreadsheet.getSheetByName(MN_SHORT_[i]).setTabColor('#3c78d8');
			}
		}

		spreadsheet.getSheetByName(MN_SHORT_[mm]).setTabColor('#6aa84f');
	} else {
		for (; i < 12; i++) {
			spreadsheet.getSheetByName(MN_SHORT_[i]).setTabColor('#a4c2f4');
		}
	}
}



function foo_UpdateCashFlow_(mm) {
	console.time("tool/update-cash-flow");

	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var sheetTarget = spreadsheet.getSheetByName(MN_SHORT_[mm]),
			sheetCashFlow = spreadsheet.getSheetByName("Cash Flow");
	var sheetBackstage;

	if (!sheetTarget) return;
	if (!sheetCashFlow) return;

	var calendar, listEventos, evento, day, yyyy, dd;
	var number_accounts, number_cards;
	var metaTags, OverrideZero;
	var data_cards, data_tags, value, maxRows;
	var table, hasCards, hasTags;
	var cf_flow, cf_transaction;
	var a, b, c, i, j, k, n, ma;
	var h_, w_;

	var dec_p = PropertiesService.getDocumentProperties().getProperty("decimal_separator");

	if (!dec_p) dec_p = "] [";

	console.time("tool/update-cash-flow/load");
	h_ = AppsScriptGlobal.TableDimensions()["height"];
	w_ = AppsScriptGlobal.TableDimensions()["width"];

	yyyy = getUserConstSettings_('financial_year');

	dd = new Date(yyyy, mm + 1, 0).getDate();
	OverrideZero = getUserSettings_("OverrideZero");
	number_accounts = getUserConstSettings_('number_accounts');

	cf_flow = [ ];
	cf_transaction = [ ];
	for (i = 0; i < dd; i++) {
		cf_flow[i] = [ "" ];
		cf_transaction[i] = [ "" ];
	}

	listEventos = [ ];
	t = getSpreadsheetDate();
	b = new Date(yyyy, mm + 1, 1);
	if ( getUserSettings_("CashFlowEvents")
			&& t.getTime() < b.getTime() ) {
		calendar = getUserSettings_("FinancialCalendar");
		calendar = optCalendar_GetCalendarFromSHA1_(calendar);

		if (calendar) {
			a = new Date(yyyy, mm, 1);
			if (t.getTime() > a.getTime() && t.getTime() < b.getTime()) {
				a = new Date(yyyy, mm, t.getDate());
			}

			listEventos = calendar.getEvents(a, b);
			if (listEventos) listEventos = optCalendar_ProcessRawEvents_(listEventos);
			else listEventos = [ ];
		}
	}

	if (OverrideZero || listEventos.length > 0) {
		data_tags = tagGetData_();
		if (data_tags && data_tags.tags.length > 0) hasTags = true;
		else hasTags = false;
	}

	maxRows = sheetTarget.getLastRow() - 4 ;
	console.timeEnd("tool/update-cash-flow/load");

	console.time("tool/update-cash-flow/registry");
	if (maxRows > 0) {
		k = 0;
		table = sheetTarget.getRange(5, 1 + 5 + 5*k, maxRows, 4).getValues();
		for (i = 0; k < number_accounts; i++) {
			if (i >= maxRows || table[i][2] === "") {
				k++;
				i = -1;
				table = sheetTarget.getRange(5, 1 + 5 + 5*k, maxRows, 4).getValues();
				continue;
			}

			day = table[i][0];
			if (day <= 0 || day > dd) continue;

			value = table[i][2];
			if (hasTags && value === 0 && OverrideZero) {
				ma = table[i][3].match(/#\w+/g);
				for (j = 0; j < ma.length; j++) {
					c = data_tags.tags.indexOf(ma[j].substr(1));
					if (c !== -1) {
						value = data_tags.average[c];
						break;
					}
				}
			}

			day--;
			cf_flow[day][0] += value.formatLocaleSignal(dec_p);
			cf_transaction[day][0] += "@" + table[i][1] + " ";
		}
	}
	console.timeEnd("tool/update-cash-flow/registry");


	console.time("tool/update-cash-flow/calendar");
	if (mm > 0) {
		sheetBackstage = spreadsheet.getSheetByName("_Backstage");
	}
	if (sheetBackstage) {
		number_cards = getPropertiesService_("document", "ojb", "DB_CARD");
		number_cards = number_cards.length;
		hasCards = number_cards > 0;
	}
	if (hasCards) {
		data_cards = cardsGetData_();
	}

	for (i = 0; i < listEventos.length; i++) {
		evento = listEventos[i];

		if (evento.Description === "") continue;
		if (evento.hasAtIgn) continue;

		if ( !isNaN(evento.Value) ) value = evento.Value;
		else if (hasCards && evento.hasQcc) {
			if (evento.Card !== -1) {
				c = data_cards.cards.indexOf(evento.Card);
				if (c === -1) continue;
			} else {
				c = 0;
			}

			if (evento.TranslationType === "M"
					&& mm + evento.TranslationNumber >= 0
					&& mm + evento.TranslationNumber <= 11) {
				value = +data_cards.balance[c][mm + evento.TranslationNumber].toFixed(2);
			} else {
				value = +data_cards.balance[c][mm - 1].toFixed(2);
			}
		} else if (hasTags && evento.Tags.length > 0) {
			n = evento.Tags.length;
			for (j = 0; j < n; j++) {
				c = data_tags.tags.indexOf(evento.Tags[j]);
				if (c !== -1) break;
			}

			if (c === -1) continue;

			switch (evento.TranslationType) {
				default:
					console.warn("foo_UpdateCashFlow_(): Switch case is default.", evento.TranslationType);
				case "Avg":
				case "":
					value = data_tags.average[c];
					break;
				case "Total":
					value = data_tags.total[c];
					break;
				case "M":
					if (mm + evento.TranslationNumber < 0 || mm + evento.TranslationNumber > 11) continue;

					value = data_tags.months[c][mm + evento.TranslationNumber];
					break;
			}
		} else {
			continue;
		}

		day = evento.Day - 1;
		cf_flow[day][0] += value.formatLocaleSignal(dec_p);
		cf_transaction[day][0] += "@" + evento.Title + " ";
	}
	console.timeEnd("tool/update-cash-flow/calendar");


	sheetCashFlow.getRange(3, 2 + 4*mm, dd, 1).setFormulas(cf_flow);
	sheetCashFlow.getRange(3, 4 + 4*mm, dd, 1).setValues(cf_transaction);
	SpreadsheetApp.flush();
	console.timeEnd("tool/update-cash-flow");
}



function foo_FormatAccounts_(mm) {
	if (typeof mm != "number" || isNaN(mm)) {
		showDialogErrorMessage();
		console.warn("foo_FormatAccounts_(): type of parameter is incorrect.", {mm:mm, type:typeof mm});
		return;
	}

	var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MN_SHORT_[mm]);
	var number_accounts = getUserConstSettings_('number_accounts');
	var date1, date2;
	var table, nd;
	var c, n, i, k;
	var w_;

	w_ = AppsScriptGlobal.TableDimensions()["width"];

	n = sheet.getMaxRows() - 4;
	if (n < 1) return;

	c = 0;
	sheet.showRows(5, n);

	for (k = 0; k < 1 + number_accounts; k++) {
		sheet.getRange(5, 1 + w_*k, n, 4).sort([
			{column:(1 + w_*k), ascending:true},
			{column:(4 + w_*k), ascending:false}
		]);

		i = 0;
		nd = 0;
		table = sheet.getRange(5, 1 + w_*k, n, 4).getValues();
		while (i < n && table[i][2] !== '') {
			if (table[i][0] < 0) nd++;
			i++;
		}

		if (i > c) c = i;
		if (nd > 1) sheet.getRange(5, 1 + w_*k, nd, 4).sort({column:1 + w_*k, ascending:false});
	}

	date1 = new Date().getTime();
	date2 = getUserConstSettings_('financial_year');
	date2 = new Date(date2, mm + 1, 0).getTime();

	if (c > 0 && c < n && date2 < date1) sheet.hideRows(5 + c, n - c);
}


function foo_FormatCards_(mm) {
	if (typeof mm !== "number" || isNaN(mm)) {
		showDialogErrorMessage();
		console.warn("foo_FormatCards_(): type of parameter is incorrect.", {mm:mm, type:typeof mm});
		return;
	}

	var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Cards');
	var table, card;
	var c, n, w_;
	var i, j;

	w_ = 6;
	n = sheet.getMaxRows() - 5;

	sheet.getRange(6, 1 + w_*mm, n, 5).sort([
		{column:(3 + w_*mm), ascending:true},
		{column:(1 + w_*mm), ascending:true},
		{column:(4 + w_*mm), ascending:false}
	]);

	i = 0;
	j = 0;
	table = sheet.getRange(6, 1 + w_*mm, n, 5).getValues();
	while (i < n && table[i][3] !== '') {
		c = 0;
		card = table[i][2];
		while (j < n && table[j][3] !== '' && table[j][2] === card) {
			if (table[j][0] < 0) c++;
			j++;
		}

		if (c > 1) sheet.getRange(6 + i, 1 + w_*mm, c, 5).sort({column:1 + w_*mm, ascending:false});
		i = j;
	}
}
