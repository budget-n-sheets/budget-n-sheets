function toolShowSheets_() {
	pagesView_("show");
}

function toolHideSheets_() {
	pagesView_("hide");
}

function pagesView_(select, a) {
	var lock = LockService.getDocumentLock();
	try {
		lock.waitLock(2000);
	} catch (err) {
		SpreadsheetApp.getUi().alert(
			"Add-on is busy",
			"The add-on is busy. Try again in a moment.",
			SpreadsheetApp.getUi().ButtonSet.OK);

		consoleLog_('warn', 'pagesView_(): Wait lock time out.', err);
		return;
	}

	switch (select) {
		case "show":
			showSheets_();
			break;
		case "hide":
			hideSheets_(a);
			break;

		default:
			console.error("pagesView_(): Switch case is default.", select);
			break;
	}
}


function hideSheets_(a) {
	var spreadsheet, sheet;
	var delta, mm, i;

	if (a) {
		mm = DATE_NOW.getMonth();
	} else {
		sheet = SpreadsheetApp.getActiveSheet();
		mm = MN_SHORT.indexOf( sheet.getName() );
		if (mm === -1) {
			SpreadsheetApp.getUi().alert(
				"Can't collapse pages view",
				"Select a month to collapse pages view.",
				SpreadsheetApp.getUi().ButtonSet.OK);
			return;
		}
	}

	spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	delta = getMonthDelta(mm);

	for (i = 0; i < 12; i++) {
		sheet = spreadsheet.getSheetByName(MN_SHORT[i]);
		if (sheet) {
			if (i < mm + delta[0] || i > mm + delta[1]) sheet.hideSheet();
			else sheet.showSheet();
		}
	}
}


function showSheets_() {
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var sheet, i;

	for (i = 0; i < 12; i++) {
		sheet = spreadsheet.getSheetByName(MN_SHORT[i]);
		if (sheet) sheet.showSheet();
	}
}


function toolAddBlankRows() {
	toolPicker_("AddBlankRows");
}

function toolUpdateCashFlow() {
	toolPicker_("UpdateCashFlow");
}

function toolFormatRegistry() {
	toolPicker_("FormatRegistry");
}

function toolPicker_(select, value) {
	var lock = LockService.getDocumentLock();
	try {
		lock.waitLock(2000);
	} catch (err) {
		SpreadsheetApp.getUi().alert(
			"Add-on is busy",
			"The add-on is busy. Try again in a moment.",
			SpreadsheetApp.getUi().ButtonSet.OK);

		consoleLog_('warn', 'toolPicker_(): Wait lock time out.', err);
		return;
	}

	switch (select) {
		case 'AddBlankRows':
			addBlankRows_(value);
			break;
		case 'UpdateCashFlow':
			validateUpdateCashFlow_(value);
			break;
		case 'FormatRegistry':
			validateFormatRegistry_();
			break;
		case 'FormatAccount':
			formatAccounts_(value);
			break;
		case 'FormatCards':
			formatCards_(value);
			break;

		default:
			console.error("toolPicker_(): Switch case is default.", select);
			break;
	}
}


function addBlankRows_(name) {
	var sheet, c;

	if (!name) {
		sheet = SpreadsheetApp.getActiveSheet();
		name = sheet.getSheetName();
	}

	if (name === "Cards") c = 5;
	else if (MN_SHORT.indexOf(name) !== -1) c = 4;
	else {
		SpreadsheetApp.getUi().alert(
			"Can't add rows",
			"Select a month or Cards to add rows.",
			SpreadsheetApp.getUi().ButtonSet.OK);
		return;
	}

	if (!sheet) {
		sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
		if (!sheet) return;
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


function validateFormatRegistry_() {
	var range = SpreadsheetApp.getActiveRange();
	var sheet = range.getSheet();
	var name = sheet.getSheetName();
	var mm;

	if (name === "Cards") {
		mm = range.getColumn();
		mm = (mm - (mm % 6)) / 6;
		formatCards_(mm);

	} else {
		mm = MN_SHORT.indexOf(name);
		if (mm === -1) {
			SpreadsheetApp.getUi().alert(
				"Can't sort registry",
				"Select a month or Cards to sort the registry.",
				SpreadsheetApp.getUi().ButtonSet.OK);
			return;
		}
		formatAccounts_(mm);
	}
}


function updateCashFlow_(sheetMonth, mm) {
	console.time("tool/update-cash-flow");
	var spreadsheet, sheetCashFlow, sheetBackstage;
	var calendar, listEventos, evento, day;
	var metaTags;
	var data_cards, data_tags, value, maxRows;
	var table, hasCards, hasTags;
	var cf_flow, cf_transactions;
	var a, b, c, i, j, k, n, ma, t, x, i1;

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
		k = 0;
		table = sheetMonth.getRange(5, 1 + 5 + 5*k, maxRows, 4).getValues();
		for (i = 0; k < num_acc; i++) {
			if (i >= maxRows || table[i][2] === "") {
				k++;
				i = -1;
				table = sheetMonth.getRange(5, 1 + 5 + 5*k, maxRows, 4).getValues();
				continue;
			}

			day = table[i][0];
			if (day <= 0 || day > dd) continue;

			value = table[i][2];
			if (hasTags && value === 0 && override_zero) {
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
			cf_transactions[day] += "@" + table[i][1] + " ";
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
			cf_flow[day] += value.formatLocaleSignal(dec_p);
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


function formatAccounts_(mm) {
	var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MN_SHORT[mm]);
	var date1, date2;
	var table, nd;
	var c, n, i, k;

	const w_ = TABLE_DIMENSION.width;
	const num_acc = getConstProperties_('number_accounts');

	if (!sheet) return;
	if (sheet.getMaxColumns() < 5 + 5*num_acc) return;

	n = sheet.getMaxRows() - 4;
	if (n < 1) return;

	c = 0;
	sheet.showRows(5, n);

	for (k = 0; k < 1 + num_acc; k++) {
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

	date1 = DATE_NOW.getTime();
	date2 = getConstProperties_('financial_year');
	date2 = new Date(date2, mm + 1, 0).getTime();

	if (c > 0 && c < n && date2 < date1) sheet.hideRows(5 + c, n - c);
}


function formatCards_(mm) {
	var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Cards');
	var table, card;
	var c, n, w_;
	var i, j;

	if (!sheet) return;

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
	if (!sheet) return;

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
