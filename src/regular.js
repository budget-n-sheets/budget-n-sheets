function daily_PostEvents_(date) {
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var sheet, data, lastRow;

	var calendar, list_to_mute, list_eventos, evento;
	var mm, dd, value, tags;
	var number_accounts, dec_p;
	var type, card, cell;
	var a, i, j, k;

	calendar = getFinancialCalendar_();
	if (!calendar) return;

	list_eventos = calendar.getEventsForDay(date);
	if (list_eventos.length == 0) return;

	list_eventos = calendarDigestListEvents_(list_eventos);

	list_to_mute = [ ];
	mm = date.getMonth();
	dd = date.getDate();

	number_accounts = getUserConstSettings_('number_accounts');

	dec_p = PropertiesService.getDocumentProperties().getProperty('decimal_separator');
	if (!dec_p) dec_p = "] [";

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

		cell = {
			id: evento.Id,
			isRecurring: evento.isRecurring
		};
		list_to_mute.push(cell);
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

	sheet = spreadsheet.getSheetByName(MN_SHORT_[mm]);
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

	setUserSettings_('spreadsheet_locale', spreadsheet.getSpreadsheetLocale());
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
			init_month = getUserSettings_('initial_month');
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
