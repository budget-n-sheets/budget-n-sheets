function playSpeedQuickstart(id) {
	var lock = LockService.getDocumentLock();
	try {
		lock.waitLock(200);
	} catch (err) {
		SpreadsheetApp.getActiveSpreadsheet().toast("The add-on is busy. Try again in a moment.", "Budget n Sheets");
		return;
	}

	const channel = id.match(/(statements|transactions|acc_cards|tags)(\d)/);
	if (!channel) throw new Error("playSpeedQuickstart(): No match found.");

	const job = channel[1];
	const n = Number(channel[2]);

	switch (job) {
	case "statements":
		playQuickStatements(n);
		break;
	case "transactions":
		playQuickTransactions(n);
		break;
	case "acc_cards":
		playQuickAccCards(n);
		break;
	case "tags":
		playQuickTags(n);
		break;

	default:
		console.warn("playSpeedQuickstart(): Switch case is default " + job);
		break;
	}
}

function playQuickStatements(n) {
	n = Number(n);

	var sheet, lastRow;
	var data, col, val;

	const financial_year = getConstProperties_("financial_year");

	if (financial_year === DATE_NOW.getFullYear()) {
		sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MN_SHORT[ DATE_NOW.getMonth() ]);
	} else {
		sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MN_SHORT[0]);
	}

	lastRow = sheet.getLastRow();

	switch (n) {
	case 1:
		col = 1;
		data = [
			[ 7, "Coffee shop", randomValueNegative(2, 2), "" ]
		];
		break;
	case 2:
		col = 6;
		data = [
			[ 7, "Grocery shop", randomValueNegative(2, 2), "" ]
		];
		break;
	case 3:
		col = 1;
		data = [
			[
				7, "Paycheck (in cash)", randomValue(3, 2), "#rct", null,
				7, "Income (via transfer #trf)", randomValue(3, 2), "#trf #rct"
			],
			[
				null, null, null, null, null,
				7, "Income (via deposit #dp)", randomValue(3, 2), "#dp #rct"
			]
		];
		break;
	case 4:
		col = 1 + 5*randomInteger(2);
		val = -randomInteger(20);
		data = [
			[ 7, "Pizza, my share", val, "" ],
			[ 7, "Pizza, others share (not accounted in expenses)", val*3, "#ign" ]
		];
		break;
	default:
		console.warn("playQuickStatements(): Switch case is default " + n);
		return;
	}

	if (sheet.getMaxRows() < lastRow + data.length) {
		toolPicker_("AddBlankRows", sheet.getName());
	}

	sheet.getRange(lastRow + 1, col, data.length, data[0].length)
		.setValues(data)
		.activate();
	SpreadsheetApp.flush();
}

function playQuickTransactions(n) {
	n = Number(n);

	var sheet, lastRow;
	var data;

	const financial_year = getConstProperties_("financial_year");

	if (financial_year === DATE_NOW.getFullYear()) {
		sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MN_SHORT[ DATE_NOW.getMonth() ]);
	} else {
		sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MN_SHORT[0]);
	}

	lastRow = sheet.getLastRow();

	switch (n) {
	case 1:
		data = [
			[ 7, "Deposit (to my account #dp)", randomValue(3, 2), "#dp" ]
		];
		break;
	case 2:
		data = [
			[ 7, "Transfer (from someone #trf)", randomValue(3, 2), "#trf" ]
		];
		break;
	case 3:
		data = [
			[ 7, "Transfer (to someone #trf)", randomValueNegative(3, 2), "#trf" ]
		];
		break;
	case 4:
		data = [
			[ 7, "Withdrawal (cash dispenser #wd)", randomValueNegative(3, 2), "#wd" ]
		];
		break;
	default:
		console.warn("playQuickStatements(): Switch case is default " + n);
		return;
	}

	if (sheet.getMaxRows() < lastRow + data.length) {
		toolPicker_("AddBlankRows", sheet.getName());
	}

	sheet.getRange(lastRow + 1, 6, data.length, data[0].length)
		.setValues(data)
		.activate();
	SpreadsheetApp.flush();
}

function playQuickAccCards(n) {
	n = Number(n);

	if (n === 1) {
		const db_acc = getDbTables_("accounts");
		showDialogEditAccount(db_acc.ids[0]);
		return;

	} else if (n === 2) {
		showDialogAddCard();
		return;

	} else if (n !== 3 && n !== 4) {
		console.warn("playQuickAccCards(): Switch case is default " + n);
		return;
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

	if (n === 3) {
		sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Cards");
		if (!sheet) return;

		if (financial_year === DATE_NOW.getFullYear()) {
			mm = DATE_NOW.getMonth();
			if (mm === 0) mm = 1;
			else if (mm === 11) mm = 10;
		} else {
			mm = 1;
		}

		col = 1 + 6*mm - 6;
		val = randomValueNegative(2, 2);

		data = [
			[
				7, "Online shopping 1/3 (with instalments in d/d format)", code, val, null, null,
				-7, "Online shopping 2/3 (with instalments in d/d format)", code, val, null, null,
				-7, "Online shopping 3/3 (with instalments in d/d format)", code, val, null, null
			],
			[
				null, null, null, null, null, null,
				3, "Grocery shop", code, -10, null, null,
				null, null, null, null, null, null
			],
			[
				null, null, null, null, null, null,
				5, "Gas station", code, randomValueNegative(3, 2), null, null,
				null, null, null, null, null, null
			],
			[
				null, null, null, null, null, null,
				5, "Grocery shop refund", code, 10, null, null,
				null, null, null, null, null, null
			]
		];
	} else if (n === 4) {
		if (financial_year === DATE_NOW.getFullYear()) {
			sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MN_SHORT[ DATE_NOW.getMonth() ]);
		} else {
			sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MN_SHORT[0]);
		}

		if (!sheet) return;

		col = 6;

		data = [
			[ 7, code + " bill payment", randomValueNegative(3, 2), "#qcc" ]
		];
	}

	lastRow = sheet.getLastRow();

	if (sheet.getMaxRows() < lastRow + data.length) {
		toolPicker_("AddBlankRows", sheet.getName());
	}

	sheet.getRange(lastRow + 1, col, data.length, data[0].length)
		.setValues(data)
		.activate();
	SpreadsheetApp.flush();
}

function playQuickTags(n) {
	n = Number(n);

	var sheet, lastRow, range, col;
	var data, tmp;

	if (n === 1) {
		col = 1;
		sheet = "Tags";

		data = [
			[ "Coffee", "Food and supply", "My coffee addiction tracker", "TRUE", "coffee" ]
		];

	} else if (n === 2) {
		const financial_year = getConstProperties_("financial_year");

		col = 6;
		if (financial_year === DATE_NOW.getFullYear()) sheet = MN_SHORT[ DATE_NOW.getMonth() ];
		else sheet = MN_SHORT[0];

		data = [
			[ 3, "Bus to Abc", randomValueNegative(2, 2), "#trip1" ],
			[ 3, "Abc Pizza, lunch", randomValueNegative(2, 2), "#trip1" ],
			[ 4, "Coffee Abc", randomValueNegative(2, 2), "#trip1 #coffee" ],
			[ 7, "Flight to Def", randomValueNegative(2, 2), "#trip2" ],
			[ 8, "Tower Def", randomValueNegative(2, 2), "#trip2" ]
		];

	} else if (n === 3) {
		col = 1;
		sheet = "Tags";

		data = [
			[ "All trips", "Traveling", "Accounts statements with #trip, #trip1 or #trip2 tag", "TRUE", "trip" ],
			[ "Trip to Abc", "Traveling", "Accounts statements with #trip1 tag", "FALSE", "trip1" ],
			[ "Trip to Def", "Traveling", "Accounts statements with #trip1 tag", "FALSE", "trip2" ]
		];

	} else {
		console.warn("playQuickTags(): Switch case is default " + n);
		return;
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
