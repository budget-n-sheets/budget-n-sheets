var QUICKSTART_DATA = Object.freeze({
	calendar: {
		1: [
			{day: 2, title: "The simplest event", description: "acc_name\nvalue", value: -1.23},
			{day: 3, title: "Muted event", description: "acc_name\nvalue\n\n@muted", value: -1.23},
			{day: 5, title: "Payday", description: "acc_name\nvalue\n\n#trf #rct", value: 1234.56}
		],
		2: [
			{day: 7, title: "Card bill payment", description: "card_code\n\n#qcc"}
		],
		3: [
			{day: 11, length: 2, title: "Two-days event", description: "acc_name\n-$1.23"}
		]
	},
	statements: {
		1: [[ 7, "Coffee shop", null, "" ]],
		2: [[ 7, "Grocery shop", null, "" ]],
		3: [
			[ 7, "Paycheck (in cash), use #rct tag", null, "#rct", null,
				7, "Income (via transfer #trf), use #rct tag", null, "#trf #rct" ],
			[	null, null, null, null, null,
				7, "Income (via deposit #dp), use #rct tag", null, "#dp #rct" ]
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

function alertQuickstartSheetMissing(name) {
	SpreadsheetApp.getUi().alert(
		"Can't show example",
		"Sheet \"" + name + "\" couldn't be found.",
		SpreadsheetApp.getUi().ButtonSet.OK);
}

function playSpeedQuickstart(id) {
	if (! isInstalled_()) return;

	var lock = LockService.getDocumentLock();
	try {
		lock.waitLock(200);
	} catch (err) {
		SpreadsheetApp.getActiveSpreadsheet().toast("The add-on is busy. Try again in a moment.", "Budget n Sheets");
		return;
	}

	SpreadsheetApp.getActiveSpreadsheet().toast("Playing the example...", "Quickstart");

	const channel = id.match(/(statements|cashflow|transactions|calendar|acc_cards|tags)(\d)/);
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
	case "calendar":
		playQuickCalendar_(n);
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

function playQuickCalendar_(n) {
	var ui = SpreadsheetApp.getUi();
	var calendar = getFinancialCalendar_();
	var data, value, description, mm;

	if (!calendar) {
		ui.alert(
			"Can't create events",
			"Select a bill calendar first in the settings.",
			ui.ButtonSet.OK);
		return;

	} else if (! calendar.isOwnedByMe()) {
		ui.alert(
			"Permission denied",
			"You are not the owner of the selected calendar.",
			ui.ButtonSet.OK);
		return;
	}

	const yyyy = DATE_NOW.getFullYear();
	const financial_year = getConstProperties_("financial_year");

	if (yyyy === financial_year) {
		mm = DATE_NOW.getMonth() + 1;
		if (mm === 12) {
			ui.alert(
				"Can't create events",
				"This example is unavailble because the year is almost round. Try in the budget sheet of the next year.",
				ui.ButtonSet.OK);
			return;
		}

	} else if (yyyy < financial_year) {
		mm = getUserSettings_("initial_month");

	} else {
		ui.alert(
			"Can't create events",
			"This example is unavailble. Try in a budget sheet of the current year.",
			ui.ButtonSet.OK);
		return;
	}

	const db_tables = getDbTables_();
	const acc_name = db_tables.accounts.names[0];
	const card_code = (db_tables.cards.count > 0 ? db_tables.cards.codes[0] : "");

	data = QUICKSTART_DATA.calendar[1];
	if (!data) throw new Error("Values for quickstart example couldn't be found. calendar " + n);

	for (var i = 0; i < data.length; i++) {
		description = data[i].description;
		description = description.replace("acc_name", acc_name);

		if (data[i].value) {
			value = data[i].value.formatCalendarSignal();
			description = description.replace("value", value);
		}

		calendar.createAllDayEvent(
			data[i].title,
			new Date(financial_year, mm, data[i].day),
			{description: description}
		);
		Utilities.sleep(200);
	}

	if (card_code) {
		data = QUICKSTART_DATA.calendar[2];
		if (!data) throw new Error("Values for quickstart example couldn't be found. calendar " + n);

		for (var i = 0; i < data.length; i++) {
			description = data[i].description;
			description = description.replace("card_code", card_code);

			if (data[i].value) {
				value = data[i].value.formatCalendarSignal();
				description = description.replace("value", value);
			}

			calendar.createAllDayEvent(
				data[i].title,
				new Date(financial_year, mm, data[i].day),
				{description: description}
			);
		}
	}

	data = QUICKSTART_DATA.calendar[3];
	if (!data) throw new Error("Values for quickstart example couldn't be found. calendar " + n);

	for (var i = 0; i < data.length; i++) {
		description = data[i].description;
		description = description.replace("acc_name", acc_name);

		if (data[i].value) {
			value = data[i].value.formatCalendarSignal();
			description = description.replace("value", value);
		}

		calendar.createAllDayEvent(
			data[i].title,
			new Date(financial_year, mm, data[i].day),
			new Date(financial_year, mm, data[i].day + data[i].length),
			{description: description}
		);
	}

	setUserSettings_("cash_flow_events", true);
	updateCashFlow_(mm);

	SpreadsheetApp.getActiveSpreadsheet()
		.getSheetByName("Cash Flow")
		.getRange(1, 2 + 4*mm, 1, 3)
		.activate();
}

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

function playQuickStatements_(n) {
	var sheet, lastRow;
	var data, name, col, val;

	const financial_year = getConstProperties_("financial_year");

	if (financial_year === DATE_NOW.getFullYear()) name = MN_SHORT[ DATE_NOW.getMonth() ];
	else name = MN_SHORT[0];

	sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
	if (!sheet) {
		alertQuickstartSheetMissing(name);
		return;
	}
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
  fillMonthWithZeros(sheet);
}

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
  fillMonthWithZeros(sheet);
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
	var data, name, val, mm;

	const financial_year = getConstProperties_("financial_year");

	data = QUICKSTART_DATA.acc_cards[n];
	if (!data) throw new Error("Values for quickstart example couldn't be found. acc_cards " + n);

	if (n === 3) {
		name = "Cards";

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
		if (financial_year === DATE_NOW.getFullYear()) name = MN_SHORT[ DATE_NOW.getMonth() ];
		else name = MN_SHORT[0];

		col = 6;
		data[0][1] = code + " bill payment";
		data[0][2] = randomValueNegative(3, 2);
	}

	sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
	if (!sheet) {
		alertQuickstartSheetMissing(name);
		return;
	}
	lastRow = sheet.getLastRow();

	if (sheet.getMaxRows() < lastRow + data.length) {
		toolPicker_("AddBlankRows", sheet.getName());
	}

	sheet.getRange(lastRow + 1, col, data.length, data[0].length)
		.setValues(data)
		.activate();
	SpreadsheetApp.flush();
  if (n === 4) fillMonthWithZeros(sheet);
  else fillCardWithZeros(sheet, col);
}

function playQuickTags_(n) {
	var sheet, lastRow, range, col;
	var data, name, tmp;

	data = QUICKSTART_DATA.tags[n];
	if (!data) throw new Error("Values for quickstart example couldn't be found. tags " + n);

	switch (n) {
	case 1:
	case 3:
		col = 1;
		name = "Tags";
		break;
	case 2:
		col = 6;

		const financial_year = getConstProperties_("financial_year");
		if (financial_year === DATE_NOW.getFullYear()) name = MN_SHORT[ DATE_NOW.getMonth() ];
		else name = MN_SHORT[0];

		for (var i = 0; i < 5; i++) {
			data[i][2] = randomValueNegative(2, 2);
		}
		break;

	default:
		throw new Error("playQuickTags_(): Switch case is default. " + n);
	}

	sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
	if (!sheet) {
		alertQuickstartSheetMissing(name);
		return;
	}

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
  if (n === 2) fillMonthWithZeros(sheet);
}

function fillMonthWithZeros(sheet) {
  var values, lastRow;
  var i, k;

  lastRow = sheet.getLastRow();
  if (lastRow < 5) return;

  lastRow -= 4;
  values = sheet.getRange(5, 1, lastRow, 10).getValues();

  var n = 0;
  const list = [];

  for (k = 0; k < 2; k++) {
    i = lastRow - 1;
    while (i > -1 && values[i][2 + 5*k] === '') { i--; }

    while (i > -1) {
      if (values[i][2 + 5*k] === '') {
        list[n] = rollA1Notation(5 + i, 3 + 5*k);
        n++;
      }
      i--;
    }
  }

  if (list.length > 0) sheet.getRangeList(list).setValue(0);
  SpreadsheetApp.flush();
}

function fillCardWithZeros(sheet, col) {
  var values, lastRow;
  var i, k;

  lastRow = sheet.getLastRow();
  if (lastRow < 6) return;

  lastRow -= 5;
  values = sheet.getRange(6, col, lastRow, 18).getValues();
  col += 3;

  var n = 0;
  const list = [];

  for (k = 0; k < 3; k++) {
    i = lastRow - 1;
    while (i > -1 && values[i][3 + 6*k] === '') { i--; }

    while (i > -1) {
      if (values[i][3 + 6*k] === '') {
        list[n] = rollA1Notation(6 + i, col + 6*k);
        n++;
      }
      i--;
    }
  }

  if (list.length > 0) sheet.getRangeList(list).setValue(0);
  SpreadsheetApp.flush();
}
