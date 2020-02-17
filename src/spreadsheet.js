function copySheetsFromTemplate_() {
	console.time('add-on/setup/copy-template');
	var spreadsheetTemplate = SpreadsheetApp.openById( AppsScriptGlobal.TemplateId() ),
			spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var listSheetsTemplate = AppsScriptGlobal.TemplateSheets(),
			listSheets = spreadsheet.getSheets();
	var i;


	for (i = 0; i < listSheetsTemplate.length; i++) {
		spreadsheetTemplate.getSheetByName(listSheetsTemplate[i])
			.copyTo(spreadsheet)
			.setName(listSheetsTemplate[i]);
	}

	for (i = 0; i < listSheets.length; i++) {
		spreadsheet.deleteSheet(listSheets[i]);
	}
	console.timeEnd('add-on/setup/copy-template');
}


function deleteAllSheets_() {
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet(),
			listSheets = spreadsheet.getSheets();
	var i;


	listSheets[0].showSheet();
	spreadsheet.setActiveSheet(listSheets[0]);

	for (i = 1; i < listSheets.length; i++) {
		spreadsheet.deleteSheet(listSheets[i]);
	}

	spreadsheet.insertSheet();
	spreadsheet.deleteSheet(listSheets[0]);
}


function isMissingSheet() {
	console.time('add-on/setup/check-sheets');
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet(),
			sheet;
	var list = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "_Settings", "Cash Flow", "Tags", "_Backstage", "Cards", "Summary" ];
	var i;


	for (i = 0; i < list.length; i++) {
		sheet = spreadsheet.getSheetByName(list[i]);
		if (!sheet) return true;
	}

	return false;
	console.timeEnd('add-on/setup/check-sheets');
}
