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

		consoleLog_('warn', 'toolPicker_(): Wait lock time out.', err);
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
	var lastRow;
	var output, data;
	var n, i, j, k;

	if (!sheet) return;

	lastRow = sheet.getLastRow();
	if (lastRow < 2) return;
	if (sheet.getMaxColumns() < 20) return;

	output = {
		tags: [ ],
		months: [ ],
		average: [ ],
		total: [ ]
	};

  n = lastRow - 1;
  data = sheet.getRange(2, 5, n, 16).getValues();

  i = 0;
  j = -1;
  while (i < data.length && ++j < n) {
    if (data[i][0] === '' || !/^\w+$/.test(data[i][0])) {
      data.splice(i, 1);
      continue;
    }

    output.tags[i] = data[i][0];
    output.months[i] = data[i].slice(1, 13);

    output.average[i] = data[i][14];
    output.total[i] = data[i][15];
    i++;
  }

  output.data = data;
  return output;
}
