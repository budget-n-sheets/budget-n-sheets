function copySheetsFromTemplate_() {
	console.time("add-on/setup/copy-template");
	var source = SpreadsheetApp.openById(APPS_SCRIPT_GLOBAL_.template_id);
	var destination = SpreadsheetApp.getActiveSpreadsheet();
	var sheets = destination.getSheets();
	var i;

	const list = APPS_SCRIPT_GLOBAL_.template_sheets;

	for (i = 0; i < list.length; i++) {
		source.getSheetByName(list[i])
			.copyTo(destination)
			.setName(list[i]);
	}

	for (i = 0; i < sheets.length; i++) {
		destination.deleteSheet(sheets[i]);
	}
	console.timeEnd("add-on/setup/copy-template");
}


function deleteAllSheets_() {
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var sheets = spreadsheet.getSheets();

	sheets[0].showSheet();
	spreadsheet.setActiveSheet(sheets[0]);

	for (var i = 1; i < sheets.length; i++) {
		spreadsheet.deleteSheet(sheets[i]);
	}

	spreadsheet.insertSheet();
	spreadsheet.deleteSheet(sheets[0]);
}


function isMissingSheet() {
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

	const sheets = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "_Settings", "Cash Flow", "Tags", "_Backstage", "Cards", "Summary" ];

	for (var i = 0; i < sheets.length; i++) {
		if (! spreadsheet.getSheetByName(sheets[i])) return true;
	}

	return false;
}
