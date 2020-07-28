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

		ConsoleLog.warn(err);
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
			ConsoleLog.error("pagesView_(): Switch case is default.", select);
			break;
	}
}

function hideSheets_(a) {
	var spreadsheet, sheet;
	var delta, mm, i;

	if (a) {
		mm = getSpreadsheetDate.call(DATE_NOW).getMonth();
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
