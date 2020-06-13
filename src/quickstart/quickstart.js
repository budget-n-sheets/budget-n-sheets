var QUICKSTART_DATA = Object.freeze({
	statements: {
		1: [[ 7, "Coffee shop", null, "" ]],
		2: [[ 7, "Grocery shop", null, "" ]],
		3: [
			[ 7, "Paycheck (in cash)", null, "#rct", null,
				7, "Income (via transfer #trf)", null, "#trf #rct" ],
			[	null, null, null, null, null,
				7, "Income (via deposit #dp)", null, "#dp #rct" ]
		],
		4: [
			[ 7, "Pizza, my share", null, "" ],
			[ 7, "Pizza, others share (not accounted in expenses)", null, "#ign" ]
		]
	},
	cashflow: {

	},
	transactions: {
		1: [[ 7, "Deposit (to my account #dp)", null, "#dp" ]],
		2: [[ 7, "Transfer (from someone #trf)", null, "#trf" ]],
		3: [[ 7, "Transfer (to someone #trf)", null, "#trf" ]],
		4: [[ 7, "Withdrawal (cash dispenser #wd)", null, "#wd" ]]
	},
	acc_cards: {
		3: [
			[ 7, "Online shopping 1/3 (with instalments in d/d format)", null, null, null, null,
				-7, "Online shopping 2/3 (with instalments in d/d format)", null, null, null, null,
				-7, "Online shopping 3/3 (with instalments in d/d format)", null, null, null, null ],
			[	null, null, null, null, null, null,
				3, "Grocery shop", null, -10, null, null,
				null, null, null, null, null, null ],
			[	null, null, null, null, null, null,
				5, "Gas station", null, null, null, null,
				null, null, null, null, null, null ],
			[	null, null, null, null, null, null,
				5, "Grocery shop refund", null, 10, null, null,
				null, null, null, null, null, null ]
		],
		4: [[ 7, null, null, "#qcc" ]]
	},
	tags: {
		1: [[ "Coffee", "Food and supply", "My coffee addiction tracker", "TRUE", "coffee" ]],
		2: [
			[ 3, "Bus to Abc", null, "#trip1" ],
			[ 3, "Abc Pizza, lunch", null, "#trip1" ],
			[ 4, "Coffee Abc", null, "#trip1 #coffee" ],
			[ 7, "Flight to Def", null, "#trip2" ],
			[ 8, "Tower Def", null, "#trip2" ]
		],
		3: [
			[ "All trips", "Traveling", "Accounts statements with #trip, #trip1 or #trip2 tag", "TRUE", "trip" ],
			[ "Trip to Abc", "Traveling", "Accounts statements with #trip1 tag", "FALSE", "trip1" ],
			[ "Trip to Def", "Traveling", "Accounts statements with #trip1 tag", "FALSE", "trip2" ]
		]
	}
});

function playSpeedQuickstart(id) {
	if (! isInstalled_()) return;

	var lock = LockService.getDocumentLock();
	try {
		lock.waitLock(200);
	} catch (err) {
		SpreadsheetApp.getActiveSpreadsheet().toast("The add-on is busy. Try again in a moment.", "Budget n Sheets");
		return;
	}

	const channel = id.match(/(statements|cashflow|transactions|acc_cards|tags)(\d)/);
	if (!channel) throw new Error("playSpeedQuickstart(): No match found. " + id);

	const job = channel[1];
	const n = Number(channel[2]);

	switch (job) {
	case "statements":
		playQuickStatements_(n);
		break;
	case "cashflow":
		playQuickCashFlow_(n);
		break;
	case "transactions":
		playQuickTransactions_(n);
		break;
	case "acc_cards":
		playQuickAccCards_(n);
		break;
	case "tags":
		playQuickTags_(n);
		break;

	default:
		throw new Error("playSpeedQuickstart(): Switch case is default. " + job);
	}

	SpreadsheetApp.getActiveSpreadsheet().toast("Done.", "Quickstart");
}

function playQuickCashFlow_(n) {
	var spreadsheet, sheet, mm;

	const financial_year = getConstProperties_("financial_year");

	if (financial_year === DATE_NOW.getFullYear()) mm = DATE_NOW.getMonth();
	else mm = 0;

	spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	sheet = spreadsheet.getSheetByName("Cash Flow");
	if (!sheet) return;

	spreadsheet.setActiveSheet(sheet);
	sheet.getRange(1, 2 + 4*mm, 1, 3).activate();

	validateUpdateCashFlow_();
}

function playQuickStatements_(n) {
	var sheet, lastRow;
	var data, col, val;

	const financial_year = getConstProperties_("financial_year");

	if (financial_year === DATE_NOW.getFullYear()) sheet = MN_SHORT[ DATE_NOW.getMonth() ];
	else sheet = MN_SHORT[0];

	sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet);
	if (!sheet) return;
	lastRow = sheet.getLastRow();

	data = QUICKSTART_DATA.statements[n];
	if (!data) throw new Error("Values for quickstart example couldn't be found. statements " + n);

	switch (n) {
	case 1:
		col = 1;
		data[0][2] = randomValueNegative(2, 2);
		break;
	case 2:
		col = 6;
		data[0][2] = randomValueNegative(2, 2);
		break;
	case 3:
		col = 1;
		data[0][2] = randomValue(3, 2);
		data[0][7] = randomValue(3, 2);
		data[1][7] = randomValue(3, 2);
		break;
	case 4:
		val = -randomInteger(20);
		col = 1 + 5*randomInteger(2);
		data[0][2] = val;
		data[1][2] = 3*val;
		break;

	default:
		throw new Error("playQuickStatements_(): Switch case is default. " + n);
	}

	if (sheet.getMaxRows() < lastRow + data.length) {
		toolPicker_("AddBlankRows", sheet.getName());
	}

	sheet.getRange(lastRow + 1, col, data.length, data[0].length)
		.setValues(data)
		.activate();
	SpreadsheetApp.flush();
}

function playQuickTransactions_(n) {
	var sheet, lastRow;
	var data;

	const financial_year = getConstProperties_("financial_year");

	if (financial_year === DATE_NOW.getFullYear()) sheet = MN_SHORT[ DATE_NOW.getMonth() ];
	else sheet = MN_SHORT[0];

	sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet);
	if (!sheet) return;
	lastRow = sheet.getLastRow();

	data = QUICKSTART_DATA.transactions[n];
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
}

function playQuickAccCards_(n) {
	switch (n) {
	case 1:
		const db_acc = getDbTables_("accounts");
		showDialogEditAccount(db_acc.ids[0]);
		return;
	case 2:
		showDialogAddCard();
		return;
	case 3:
	case 4:
		break;

	default:
		throw new Error("playQuickAccCards_(): Switch case is default. " + n);
	}

	const db_cards = getDbTables_("cards");
	if (db_cards.count === 0) {
		showDialogAddCard();
		return;
	} else {
		const code = db_cards.codes[0];
	}

	var sheet, lastRow, col;
	var data, val, mm;

	const financial_year = getConstProperties_("financial_year");

	data = QUICKSTART_DATA.acc_cards[n];
	if (!data) throw new Error("Values for quickstart example couldn't be found. acc_cards " + n);

	if (n === 3) {
		sheet = "Cards";

		if (financial_year === DATE_NOW.getFullYear()) {
			mm = DATE_NOW.getMonth();
			if (mm === 0) mm = 1;
			else if (mm === 11) mm = 10;
		} else {
			mm = 1;
		}

		col = 1 + 6*mm - 6;
		val = randomValueNegative(2, 2);
		data[0][2] = code;
		data[0][3] = val;
		data[0][8] = code;
		data[0][9] = val;
		data[0][14] = code;
		data[0][15] = val;
		data[1][8] = code;
		data[2][8] = code;
		data[2][9] = randomValueNegative(3, 2);
		data[3][8] = code;

	} else if (n === 4) {
		if (financial_year === DATE_NOW.getFullYear()) sheet = MN_SHORT[ DATE_NOW.getMonth() ];
		else sheet = MN_SHORT[0];

		col = 6;
		data[0][1] = code + " bill payment";
		data[0][2] = randomValueNegative(3, 2);
	}

	sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet);
	if (!sheet) return;
	lastRow = sheet.getLastRow();

	if (sheet.getMaxRows() < lastRow + data.length) {
		toolPicker_("AddBlankRows", sheet.getName());
	}

	sheet.getRange(lastRow + 1, col, data.length, data[0].length)
		.setValues(data)
		.activate();
	SpreadsheetApp.flush();
}

function playQuickTags_(n) {
	var sheet, lastRow, range, col;
	var data, tmp;

	data = QUICKSTART_DATA.tags[n];
	if (!data) throw new Error("Values for quickstart example couldn't be found. tags " + n);

	switch (n) {
	case 1:
	case 3:
		col = 1;
		sheet = "Tags";
		break;
	case 2:
		col = 6;

		const financial_year = getConstProperties_("financial_year");
		if (financial_year === DATE_NOW.getFullYear()) sheet = MN_SHORT[ DATE_NOW.getMonth() ];
		else sheet = MN_SHORT[0];

		for (var i = 0; i < 5; i++) {
			data[i][2] = randomValueNegative(2, 2);
		}
		break;

	default:
		throw new Error("playQuickTags_(): Switch case is default. " + n);
	}

	sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet);
	if (!sheet) return;

	if (n === 2) {
		lastRow = sheet.getLastRow();
	} else {
		range = sheet.getRange(2, 4, sheet.getMaxRows() - 1, 2);
		tmp = range.getValues();

		range.clearContent();
		SpreadsheetApp.flush();

		lastRow = sheet.getLastRow();
		range.setValues(tmp);
		SpreadsheetApp.flush();
	}

	sheet.getRange(lastRow + 1, col, data.length, data[0].length)
		.setValues(data)
		.activate();
	SpreadsheetApp.flush();
}
