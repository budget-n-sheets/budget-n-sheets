function toolAddBlankRows() {
	toolPicker_("AddBlankRows");
}

function toolUpdateCashFlow() {
	toolPicker_("UpdateCashFlow");
}

function toolFormatRegistry() {
	toolPicker_("FormatRegistry");
}

function toolPicker_(select, value) {
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
		case 'AddBlankRows':
			addBlankRows_(value);
			break;
		case 'UpdateCashFlow':
			validateUpdateCashFlow_(value);
			break;
		case 'FormatRegistry':
			validateFormatRegistry_();
			break;
		case 'FormatAccount':
			formatAccounts_(value);
			break;
		case 'FormatCards':
			formatCards_(value);
			break;

		default:
			console.error("toolPicker_(): Switch case is default.", select);
			break;
	}
}

function getTagData_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Tags");
	var lastRow, i;

	if (!sheet) return;

	lastRow = sheet.getLastRow();
	if (lastRow < 2) return;
	if (sheet.getMaxColumns() < 20) return;

	const data = {
		tags: [ ],
		months: [ ],
		average: [ ],
		total: [ ]
	};

  const table = sheet.getRange(2, 5, lastRow - 1, 16).getValues();

  for (i = 0; i < data.length; i++) {
    if (table[i][0] === '' || !/^\w+$/.test(table[i][0])) continue;

    data.tags[i] = table[i][0];
    data.months[i] = table[i].slice(1, 13);
    data.average[i] = table[i][14];
    data.total[i] = table[i][15];
  }

  return data;
}
