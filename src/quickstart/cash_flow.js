function playQuickCashFlow_(n) {
	var spreadsheet, sheet;
	var maxRows, lastRow, values, mm, i;

	const financial_year = getConstProperties_("financial_year");

	if (financial_year === DATE_NOW.getFullYear()) mm = DATE_NOW.getMonth();
	else mm = 0;

	spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

	sheet = spreadsheet.getSheetByName(MN_SHORT[mm]);
	if (!sheet) {
		alertQuickstartSheetMissing(MN_SHORT[mm]);
		return;
	}

	maxRows = sheet.getMaxRows();
	if (maxRows < 5) return;

	lastRow = sheet.getLastRow();
	if (lastRow > 4) {
		lastRow -= 4;
		values = sheet.getRange(5, 8, lastRow, 2).getValues();

		i = 0;
		while (values[i][0] === "" && i < lastRow) { i++; }
		if (i > 0) {
			sheet.getRange(5, 8, i, 1).setValue(0);
			SpreadsheetApp.flush();
		}
	}


	sheet = spreadsheet.getSheetByName("Cash Flow");
	if (!sheet) {
		alertQuickstartSheetMissing("Cash Flow");
		return;
	}

	spreadsheet.setActiveSheet(sheet);
	sheet.getRange(1, 2 + 4*mm, 1, 3).activate();

	updateCashFlow_(mm);
}
