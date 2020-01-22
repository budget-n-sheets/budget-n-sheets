function toolShowSheets_() {
	optNavTools_("show");
}

function toolHideSheets_() {
	optNavTools_("hide");
}

function optNavTools_(p, mm) {
	var lock = LockService.getDocumentLock();
	try {
		lock.waitLock(2000);
	} catch (err) {
		SpreadsheetApp.getUi().alert(
			"Add-on is busy",
			"The add-on is busy. Try again in a moment.",
			SpreadsheetApp.getUi().ButtonSet.OK);
		console.warn("optNavTools_(): Wait lock time out.");
		return;
	}

	switch (p) {
		case "show":
			optTool_ShowSheets_();
			break;
		case "hide":
			optTool_HideSheets_(mm);
			break;

		default:
			console.error("optNavTools_(): Switch case is default.", p);
			break;
	}
}


function toolAddBlankRows() {
	optMainTools_("AddBlankRows");
}

function toolUpdateCashFlow() {
	optMainTools_("UpdateCashFlow");
}

function toolFormatRegistry() {
	optMainTools_("FormatRegistry");
}

function optMainTools_(p, mm) {
	var lock = LockService.getDocumentLock();
	try {
		lock.waitLock(2000);
	} catch (err) {
		SpreadsheetApp.getUi().alert(
			"Add-on is busy",
			"The add-on is busy. Try again in a moment.",
			SpreadsheetApp.getUi().ButtonSet.OK);
		console.warn("optMainTools_(): Wait lock time out.");
		return;
	}

	switch (p) {
		case 'AddBlankRows':
			optTool_AddBlankRows_(mm);
			break;
		case 'UpdateCashFlow':
			optTool_UpdateCashFlow_(mm);
			break;
		case 'FormatRegistry':
			optTool_FormatRegistry_();
			break;
		case 'FormatAccount':
			foo_FormatAccounts_(mm);
			break;
		case 'FormatCards':
			foo_FormatCards_(mm);
			break;

		default:
			console.error("optMainTools_(): Switch case is default.", p);
			break;
	}
}


function optTool_HideSheets_(mm) {
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var sheet;
	var d, i;

	if (mm == null) {
		sheet = SpreadsheetApp.getActiveSheet();
		mm = MN_SHORT_.indexOf( sheet.getName() );
		if (mm === -1) {
			SpreadsheetApp.getUi().alert(
				"Can't collapse pages view",
				"Select a month to collapse pages view.",
				SpreadsheetApp.getUi().ButtonSet.OK);
			return:
		}
	}

	d = getMonthDelta(mm);

	for (i = 0; i < 12; i++) {
		sheet = spreadsheet.getSheetByName(MN_SHORT_[i]);
		if (!sheet) continue;

		if (i < mm + d[0] || i > mm + d[1]) sheet.hideSheet();
		else sheet.showSheet();
	}
}


function optTool_ShowSheets_() {
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var sheet, i;

	for (i = 0; i < 12; i++) {
		sheet = spreadsheet.getSheetByName(MN_SHORT_[i]);
		if (!sheet) continue;

		sheet.showSheet();
	}
}


function optTool_AddBlankRows_(mm) {
	var sheet, c;

	if (typeof mm != "number" || isNaN(mm)) {
		sheet = SpreadsheetApp.getActiveSheet();
		c = sheet.getSheetName();

		if (MN_SHORT_.indexOf(c) !== -1) c = 4;
		else if (c === "Cards") c = 5;
		else {
			SpreadsheetApp.getUi().alert(
				"Can't add rows",
				"Select a month or Cards to add rows.",
				SpreadsheetApp.getUi().ButtonSet.OK);
			return;
		}
	} else if (mm >= 0 && mm < 12) {
		c = 4;
		sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MN_SHORT_[mm]);
	} else if (mm === 12) {
		c = 5;
		sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Cards");
	} else {
		showDialogErrorMessage();
		console.error("optTool_AddBlankRows_(): Internal error.", mm);
		return;
	}

	var maxRows = sheet.getMaxRows(),
			maxCols = sheet.getMaxColumns();
	var n = 400;
	var range, values;

	if (maxRows < c + 3) return;

	values = sheet.getRange(maxRows, 1, 1, maxCols).getValues();
	sheet.insertRowsBefore(maxRows, n);
	maxRows += n;

	sheet.getRange(maxRows - n, 1, 1, maxCols).setValues(values);
	sheet.getRange(maxRows - n + 1, 1, n - 1, maxCols).clear();
	sheet.getRange(maxRows, 1, 1, maxCols).clearContent();
	range = sheet.getRange(maxRows - n, 1, n, maxCols);
	sheet.getRange(c + 2, 1, 1, maxCols).copyTo(range, {formatOnly:true});
}


function optTool_UpdateCashFlow_(mm) {
	if (onlineUpdate_()) return;

	var sheet, range;
	var name;

	if (mm == null) {
		range = SpreadsheetApp.getActiveRange();
		sheet = range.getSheet();
		name = sheet.getSheetName();

		mm = MN_SHORT_.indexOf(name);

		if (mm === -1) {
			if (name === 'Cash Flow') {
				mm = range.getColumn() - 1;
				mm = (mm - (mm % 4)) / 4;
			} else {
				SpreadsheetApp.getUi().alert(
					"Can't update cash flow",
					"Select a month or Cash Flow to update cash flow.",
					SpreadsheetApp.getUi().ButtonSet.OK);
				return;
			}
		}
	}

	foo_UpdateCashFlow_(mm);
}


function optTool_FormatRegistry_() {
	var range = SpreadsheetApp.getActiveRange();
	var sheet = range.getSheet();
	var name = sheet.getSheetName();
	var mm;

	mm = MN_SHORT_.indexOf(name);

	if (mm !== -1) {
		foo_FormatAccounts_(mm);

	} else if (name === 'Cards') {
		mm = range.getColumn();
		mm = (mm - (mm % 6)) / 6;

		foo_FormatCards_(mm);

	} else {
		SpreadsheetApp.getUi().alert(
			"Can't sort registry",
			"Select a month to sort the registry.",
			SpreadsheetApp.getUi().ButtonSet.OK);
	}
}


function foo_UpdateCashFlow_(mm) {
	if (typeof mm !== 'number' || isNaN(mm)) {
		showDialogErrorMessage();
		console.warn("foo_UpdateCashFlow_(): type of parameter is incorrect.", {mm:mm, type:typeof mm});
		return;
	}

	console.time("tool/update-cash-flow");

	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var sheetMonth = spreadsheet.getSheetByName(MN_SHORT_[mm]),
			sheetCashFlow = spreadsheet.getSheetByName("Cash Flow");
	var sheetBackstage;

	if (!sheetMonth) return;
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
	h_ = TABLE_DIMENSION_.height;
	w_ = TABLE_DIMENSION_.width;

	yyyy = getUserConstSettings_('financial_year');

	dd = new Date(yyyy, mm + 1, 0).getDate();
	OverrideZero = getUserSettings_("OverrideZero");
	number_accounts = getUserConstSettings_('number_accounts');

	cf_flow = [ ];
	cf_transaction = [ ];
	for (i = 0; i < 31; i++) {
		cf_flow.push("");
		cf_transaction.push("");
	}

	listEventos = [ ];
	t = getSpreadsheetDate();
	b = new Date(yyyy, mm + 1, 1);
	if (getUserSettings_("CashFlowEvents") && t.getTime() < b.getTime()) {
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
		data_tags = getTagData_();
		if (data_tags && data_tags.tags.length > 0) hasTags = true;
		else hasTags = false;
	}

	maxRows = sheetMonth.getLastRow() - 4 ;
	console.timeEnd("tool/update-cash-flow/load");

	console.time("tool/update-cash-flow/registry");
	if (maxRows > 0) {
		k = 0;
		table = sheetMonth.getRange(5, 1 + 5 + 5*k, maxRows, 4).getValues();
		for (i = 0; k < number_accounts; i++) {
			if (i >= maxRows || table[i][2] === "") {
				k++;
				i = -1;
				table = sheetMonth.getRange(5, 1 + 5 + 5*k, maxRows, 4).getValues();
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

			if (typeof value !== "number") continue;

			day--;
			cf_flow[day] += value.formatLocaleSignal(dec_p);
			cf_transaction[day] += "@" + table[i][1] + " ";
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
		cf_flow[day] += value.formatLocaleSignal(dec_p);
		cf_transaction[day] += "@" + evento.Title + " ";
	}
	console.timeEnd("tool/update-cash-flow/calendar");

	if (dd < 31) {
		cf_flow.splice(dd - 31, 31 - dd);
		cf_transaction.splice(dd - 31, 31 - dd);
	}
	cf_flow = transpose([cf_flow]);
	cf_transaction = transpose([cf_transaction]);

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

	w_ = TABLE_DIMENSION_.width;

	n = sheet.getMaxRows() - 4;
	if (n < 1) return;

	c = 0;
	sheet.showRows(5, n);

	for (k = 0; k < 1 + number_accounts; k++) {
		sheet.getRange(5, 1 + w_*k, n, 4).sort([
			{column:(1 + w_*k), ascending:true},
			{column:(3 + w_*k), ascending:true}
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
		{column:(4 + w_*mm), ascending:true}
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


function getTagData_() {
	var sheet, lastRow;
	var output, data;
	var n, i, j, k, v;

	sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Tags");
	lastRow = sheet.getLastRow();
	if (lastRow < 2) return;
	if (sheet.getMaxColumns() < 20) return;

	output = {
		tags: [ ],
		months: [ ],
		average: [ ],
		total: [ ]
	};

	n = lastRow - 1;
	data = sheet.getRange(2, 5, n, 16).getValues();

	i = 0;
	j = 0;
	while (i < data.length && j < n) {
		if ( /^\w+$/.test(data[i][0]) ) {
			output.tags.push(data[i][0]);

			v = [ ];
			for (k = 0; k < 12; k++) {
			v[k] = data[i][1 + k];
			}
			output.months.push(v);

			output.average.push(data[i][14]);
			output.total.push(data[i][15]);
			i++;
		} else {
			data.splice(i, 1);
		}

		j++;
	}

	output.data = data;
	return output;
}
