var QUICKSTART_DATA_TRANSACTIONS = Object.freeze({
	1: [[ 7, "Deposit (to my account #dp)", null, "#dp" ]],
	2: [[ 7, "Transfer (from someone #trf)", null, "#trf" ]],
	3: [[ 7, "Transfer (to someone #trf)", null, "#trf" ]],
	4: [[ 7, "Withdrawal (cash dispenser #wd)", null, "#wd" ]]
});

function playQuickTransactions_(n) {
	var sheet, lastRow;
	var data, name;

	const financial_year = getConstProperties_("financial_year");

	if (financial_year === DATE_NOW.getFullYear()) name = MN_SHORT[ DATE_NOW.getMonth() ];
	else name = MN_SHORT[0];

	sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
	if (!sheet) {
		alertQuickstartSheetMissing(name);
		return;
	}
	lastRow = sheet.getLastRow();

	data = QUICKSTART_DATA_TRANSACTIONS[n];
	if (!data) throw new Error("Values for quickstart example couldn't be found. transactions " + n);

	switch (n) {
	case 1:
		data[0][2] = randomValue(3, 2);
		break;
	case 2:
		data[0][2] = randomValue(3, 2);
		break;
	case 3:
		data[0][2] = randomValueNegative(3, 2);
		break;
	case 4:
		data[0][2] = randomValueNegative(3, 2);
		break;

	default:
		throw new Error("playQuickTransactions_(): Switch case is default. " + n);
	}

	if (sheet.getMaxRows() < lastRow + data.length) {
		toolPicker_("AddBlankRows", sheet.getName());
	}

	sheet.getRange(lastRow + 1, 6, data.length, data[0].length)
		.setValues(data)
		.activate();
	SpreadsheetApp.flush();
  fillMonthWithZeros(sheet);
}
