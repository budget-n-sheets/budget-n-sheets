function toolShowSheets_() {
	optNavTools_("show");
}

function toolHideSheets_() {
	optNavTools_("hide");
}

function optNavTools_(p) {
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
			optTool_HideSheets_();
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


function optTool_HideSheets_() {
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var sheet;
	var d, mm, i;

	mm = getSpreadsheetDate();
	mm = mm.getMonth();
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


function optTool_UpdateCashFlow_(mm_) {
	if (onlineUpdate_()) return;

	var sheet, range;
	var mm;

	if (typeof mm_ !== 'number' || isNaN(mm_)) {
		sheet = SpreadsheetApp.getActiveSheet();
		range = sheet.getActiveRange();
		mm = MN_SHORT_.indexOf( sheet.getSheetName() );

	} else if (mm_ >= 0 && mm_ < 12) {
		mm = mm_;

	} else {
		console.error("optTool_UpdateCashFlow_(): Internal error.", mm_);
		return;
	}

	if (mm === -1) {
		if (sheet.getSheetName() === 'Cash Flow') {
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

	foo_UpdateCashFlow_(mm);
}


function optTool_FormatRegistry_() {
	var sheet, mm;

	sheet = SpreadsheetApp.getActiveSheet();
	mm = MN_SHORT_.indexOf( sheet.getSheetName() );

	if (mm !== -1) {
		foo_FormatAccounts_(mm);

	} else if (sheet.getSheetName() === 'Cards') {
		mm = sheet.getActiveRange().getColumn();
		mm = (mm - (mm % 6)) / 6;

		foo_FormatCards_(mm);

	} else {
		SpreadsheetApp.getUi().alert(
			"Can't format registry",
			"Select a month to format the registry.",
			SpreadsheetApp.getUi().ButtonSet.OK);
	}
}
