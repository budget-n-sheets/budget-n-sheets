function copySheetsFromTemplate_() {
	var spreadsheetTemplate = SpreadsheetApp.openById( AppsScriptGlobal.TemplateId() ),
			spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var listSheetsTemplate = AppsScriptGlobal.TemplateSheets(),
			listSheets = spreadsheet.getSheets();
	var i;


	for(i = 0;  i < listSheetsTemplate.length;  i++) {
		spreadsheetTemplate.getSheetByName(listSheetsTemplate[i])
			.copyTo(spreadsheet)
			.setName(listSheetsTemplate[i]);
	}

	for(i = 0;  i < listSheets.length;  i++) {
		spreadsheet.deleteSheet(listSheets[i]);
	}
}


function deleteAllSheets_() {
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet(),
			listSheets = spreadsheet.getSheets();
	var i;


	listSheets[0].showSheet();
	spreadsheet.setActiveSheet(listSheets[0]);

	for(i = 1;  i < listSheets.length;  i++) {
		spreadsheet.deleteSheet(listSheets[i]);
	}

	spreadsheet.insertSheet();
	spreadsheet.deleteSheet(listSheets[0]);
}


function isMissingSheet() {
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet(),
			sheet;
	var list = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "_Settings", "Cash Flow", "Tags", "_Backstage", "Cards", "Summary" ];
	var i;


	for(i = 0;  i < list.length;  i++) {
		sheet = spreadsheet.getSheetByName(list[i]);
		if(!sheet) return true;
	}

	return false;
}
