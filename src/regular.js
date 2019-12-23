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

			a = 0;
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
