function postEventsForDate_(date) {
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var sheet, data, lastRow;

	var calendar, list_eventos, evento;
	var mm, dd, value, tags;
	var number_accounts, dec_p;
	var type, card;
	var a, i, j, k;

	calendar = getFinancialCalendar_();
	if (!calendar) return;

	list_eventos = calendar.getEventsForDay(date);
	if (list_eventos.length == 0) return;

	list_eventos = calendarDigestListEvents_(list_eventos);

	mm = date.getMonth();
	dd = date.getDate();

	number_accounts = getConstProperties_('number_accounts');

	dec_p = getSpreadsheetSettings_("decimal_separator");

	data = [ ];
	for (k = 0; k < 2 + number_accounts; k++) {
		data.push({data: [ ], value: [ ]});
	}

	for (i = 0; i < list_eventos.length; i++) {
		evento = list_eventos[i];

		if (evento.Description == "") continue;
		if (evento.hasAtMute) continue;

		if (evento.Table !== -1) {
			type = 'acc';
			k = evento.Table;
		} else if (evento.Card !== -1) {
			type = 'card';
			card = evento.Card;
		} else {
			continue;
		}

		if ( !isNaN(evento.Value) ) value = evento.Value;
		else if (evento.Tags.length > 0) value = 0;
		else continue;

		value = value.formatLocaleSignal(dec_p);

		tags = "";
		for (j = 0; j < evento.Tags.length; j++) {
			tags += "#" + evento.Tags[j] + " ";
		}

		if (type == 'acc') {
			data[1 + k].data.push([ dd, evento.Title, "", tags ]);
			data[1 + k].value.push(value);
		} else if (type == 'card') {
			data[0].data.push([ dd, evento.Title, card, "", tags ]);
			data[0].value.push(value);
		}
	}

	if (data[0].data.length > 0) {
		sheet = spreadsheet.getSheetByName("Cards");
		if (sheet && sheet.getMaxRows() >= 5) {
			a = sheet.getLastRow() + 1;
			if (a < 6) a = 6;

			sheet.getRange(
					a, 1 + 6*mm,
					data[0].data.length, 5)
				.setValues(data[0].data);

			value = transpose([ data[0].value ]);
			sheet.getRange(
					a, 4 + 6*mm,
					value.length, 1)
				.setFormulas(value);
		}
	}

	data.splice(0, 1);

	sheet = spreadsheet.getSheetByName(MN_SHORT[mm]);
	if (!sheet) return;
	if (sheet.getMaxRows() < 4) return;

	a = sheet.getLastRow() + 1;
	for (k = 0; k < 1 + number_accounts; k++) {
		if (data[k].data.length == 0) continue;

		sheet.getRange(
				a, 1 + 5*k,
				data[k].data.length, 4)
			.setValues(data[k].data);

		value = transpose([ data[k].value ]);
		sheet.getRange(
				a, 3 + 5*k,
				data[k].value.length, 1)
			.setFormulas(value);
	}
}


function updateDecimalSeparator_() {
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var sheet, cell, v, t;

	sheet = spreadsheet.getSheetByName("_Settings");
	if (!sheet) {
		sheet = spreadsheet.insertSheet();
		t = true;
	}

	cell = sheet.getRange(8, 2);

	cell.setNumberFormat("0.0");
	cell.setValue(0.1);
	SpreadsheetApp.flush();

	cell = cell.getDisplayValue();
	v = /\./.test(cell);

	if (t) spreadsheet.deleteSheet(sheet);

	setSpreadsheetSettings_("decimal_separator", v);
	setSpreadsheetSettings_("spreadsheet_locale", spreadsheet.getSpreadsheetLocale());
}



function monthly_TreatLayout_(yyyy, mm) {
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var financial_year = getConstProperties_('financial_year');
	var sheets;
	var month, i;

	if (financial_year > yyyy) return; // Too soon to format the spreadsheet.
	else if (financial_year < yyyy) mm = 0; // Last time to format the spreadsheet.

	sheets = [ ];
	for (i = 0; i < 12; i++) {
		sheets[i] = spreadsheet.getSheetByName(MN_SHORT[i]);
	}

	if (mm === 0) {
		if (yyyy === financial_year) month = 0;
		else month = 11;
	} else {
		month = mm - 1;
	}

	updateHideShowSheets(sheets, financial_year, yyyy, mm);
	updateTabsColors(sheets, financial_year, yyyy, mm);
	formatAccounts_(month);
	formatCards_(month);
}


function updateHideShowSheets(sheets, financial_year, yyyy, mm) {
	var delta;

	if (mm === 0) {
		if (yyyy === financial_year) {
			for (i = 0; i < 4; i++) {
				if (sheets[i]) sheets[i].showSheet();
			}
			for (; i < 12; i++) {
				if (sheets[i]) sheets[i].hideSheet();
			}
		} else {
			for (i = 0; i < 12; i++) {
				if (sheets[i]) sheets[i].showSheet();
			}
		}
	} else {
		delta = getMonthDelta(mm);

		for (i = 0; i < 12; i++) {
			if (i < mm + delta[0] || i > mm + delta[1]) {
				if (sheets[i]) sheets[i].hideSheet();
			} else {
				if (sheets[i]) sheets[i].showSheet();
			}
		}
	}
}


function updateTabsColors(sheets, financial_year, yyyy, mm) {
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var date, delta, i;

	const init_month = getUserSettings_("initial_month");

	if (!sheets) {
		date = getSpreadsheetDate();
		yyyy = date.getFullYear();
		mm = date.getMonth();

		sheets = [ ];
		for (i = 0; i < 12; i++) {
			sheets[i] = spreadsheet.getSheetByName(MN_SHORT[i]);
		}

		financial_year = getConstProperties_("financial_year");
	}

	for (i = 0; i < init_month; i++) {
		if (sheets[i]) sheets[i].setTabColor('#b7b7b7');
	}

	if (financial_year === yyyy) {
		delta = getMonthDelta(mm);

		for (; i < 12; i++) {
			if (i < mm + delta[0] || i > mm + delta[1]) {
				if (sheets[i]) sheets[i].setTabColor('#a4c2f4');
			} else {
				if (sheets[i]) sheets[i].setTabColor('#3c78d8');
			}
		}

		if (sheets[mm]) sheets[mm].setTabColor('#6aa84f');
	} else {
		for (; i < 12; i++) {
			if (sheets[i]) sheets[i].setTabColor('#a4c2f4');
		}
	}
}
