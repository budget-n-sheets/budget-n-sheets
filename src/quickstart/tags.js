var QUICKSTART_DATA_TAGS = Object.freeze({
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
});

function playQuickTags_(n) {
	var sheet, lastRow, range, col;
	var data, name, tmp;

	data = QUICKSTART_DATA_TAGS[n];
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
