function validateUpdateCashFlow_(mm) {
	if (onlineUpdate_()) return;

	var sheet, range;
	var name;

	if (mm == null) {
		range = SpreadsheetApp.getActiveRange();
		sheet = range.getSheet();
		name = sheet.getSheetName();

		if (name === "Cash Flow") {
			mm = range.getColumn() - 1;
			mm = (mm - (mm % 4)) / 4;
			sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MN_SHORT[mm]);
		} else {
			mm = MN_SHORT.indexOf(name);
			if (mm === -1) {
				SpreadsheetApp.getUi().alert(
					"Can't update cash flow",
					"Select a month or Cash Flow to update cash flow.",
					SpreadsheetApp.getUi().ButtonSet.OK);
				return;
			}
		}
	}

	if (!sheet) {
		sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MN_SHORT[mm]);
		if (!sheet) return;
	}

	updateCashFlow_(sheet, mm);
}

function updateCashFlow_(sheetMonth, mm) {
	console.time("tool/update-cash-flow");
	var spreadsheet, sheetCashFlow, sheetBackstage;
	var calendar, listEventos, evento, day;
	var metaTags;
	var data_cards, data_tags, value, maxRows;
	var table, hasCards, hasTags;
	var cf_flow, cf_transactions;
	var a, b, c, cc, i, j, k, n, ma, t, x, i1;

	console.time("tool/update-cash-flow/load");
	spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	sheetCashFlow = spreadsheet.getSheetByName("Cash Flow");

	if (!sheetCashFlow) return;

	const h_ = TABLE_DIMENSION.height;
	const w_ = TABLE_DIMENSION.width;

	const num_acc = getConstProperties_("number_accounts");
	const financial_year = getConstProperties_("financial_year");
	const override_zero = getUserSettings_("override_zero");
	const dec_p = getSpreadsheetSettings_("decimal_separator");

	const dd = new Date(financial_year, mm + 1, 0).getDate();

	cf_flow = [ ];
	cf_transactions = [ ];
	for (i = 0; i < 31; i++) {
		cf_flow[i] = "";
		cf_transactions[i] = "";
	}

	listEventos = getCalendarEventsForCashFlow_(financial_year, mm);

	if (override_zero || listEventos.length > 0) {
		data_tags = getTagData_();
		if (data_tags && data_tags.tags.length > 0) hasTags = true;
		else hasTags = false;
	}

	maxRows = sheetMonth.getLastRow() - 4 ;
	console.timeEnd("tool/update-cash-flow/load");

	console.time("tool/update-cash-flow/registry");
	if (maxRows > 0) {
    table = sheetMonth.getRange(5, 6, maxRows, 5*num_acc).getValues();

    i = 0;
		k = 0;
    cc = 5*k;
		while (k < num_acc) {
			if (i >= maxRows || table[i][2 + cc] === "") {
				k++;
        cc = 5*k;
				i = 0;
				continue;
			}

			day = table[i][0 + cc];
			if (day <= 0 || day > dd) {
        i++;
        continue;
      }

			value = table[i][2 + cc];
			if (hasTags && value === 0 && override_zero) {
				ma = table[i][3 + cc].match(/#\w+/g);
				for (j = 0; j < ma.length; j++) {
					c = data_tags.tags.indexOf(ma[j].substr(1));
					if (c !== -1) {
						value = data_tags.average[c];
						break;
					}
				}
			}

			if (typeof value !== "number") {
        i++;
        continue;
      }

			day--;
			cf_flow[day] += numberFormatLocaleSignal.call(value, dec_p);
			cf_transactions[day] += "@" + table[i][1 + cc] + " ";

      i++;
		}
	}
	console.timeEnd("tool/update-cash-flow/registry");


	console.time("tool/update-cash-flow/calendar");
	if (mm > 0) {
		sheetBackstage = spreadsheet.getSheetByName("_Backstage");
	}
	if (sheetBackstage) {
		data_cards = getTablesService_("cardsbalances");
		if (data_cards && data_cards !== 1) hasCards = true;
	}

	for (i = 0; i < listEventos.length; i++) {
		evento = listEventos[i];

		if (evento.Description === "") continue;
		if (evento.hasAtMute) continue;

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
					console.warn("updateCashFlow_(): Switch case is default.", evento.TranslationType);
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

		for (i1 = 0; i1 < evento.Day.length; i1++) {
			day = evento.Day[i1] - 1;
			cf_flow[day] += numberFormatLocaleSignal.call(value, dec_p);
			cf_transactions[day] += "@" + evento.Title + " ";
		}
	}
	console.timeEnd("tool/update-cash-flow/calendar");

	if (dd < 31) {
		cf_flow.splice(dd - 31, 31 - dd);
		cf_transactions.splice(dd - 31, 31 - dd);
	}
	cf_flow = transpose([ cf_flow ]);
	cf_transactions = transpose([ cf_transactions ]);

	sheetCashFlow.getRange(4, 2 + 4*mm, dd, 1).setFormulas(cf_flow);
	sheetCashFlow.getRange(4, 4 + 4*mm, dd, 1).setValues(cf_transactions);
	SpreadsheetApp.flush();
	console.timeEnd("tool/update-cash-flow");
}
