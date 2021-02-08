function toolAddBlankRows () {
  console.info('menu/Add blank rows');
  toolPicker_('AddBlankRows');
}

function toolUpdateCashFlow () {
  console.info('menu/Update cash flow');
  toolPicker_('UpdateCashFlow');
}

function toolFormatRegistry () {
  console.info('menu/Format table');
  toolPicker_('FormatRegistry');
}

function toolPicker_ (select, value) {
  const lock = LockService.getDocumentLock();
  try {
    lock.waitLock(200);
  } catch (err) {
    SpreadsheetApp2.getUi().alert(
      'Add-on is busy',
      'The add-on is busy. Try again in a moment.',
      SpreadsheetApp2.getUi().ButtonSet.OK);

    ConsoleLog.warn(err);
    return;
  }

  switch (select) {
    case 'AddBlankRows':
      addBlankRows_(value);
      break;
    case 'UpdateCashFlow':
      validateUpdateCashFlow_();
      break;
    case 'UpdateCashFlowMm':
      if (seamlessUpdate_()) break;
      updateCashFlow_(value);
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
      ConsoleLog.error('toolPicker_(): Switch case is default.', select);
      break;
  }

  lock.releaseLock();
}

function getTagData_ () {
  const data = {
    tags: [],
    months: [],
    average: [],
    total: []
  };

  const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('Tags');
  if (!sheet) return data;
  if (sheet.getMaxColumns() < 20) return data;

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return data;

  const table = sheet.getRange(2, 5, lastRow - 1, 16).getValues();

  for (let i = 0; i < table.length; i++) {
    if (table[i][0] === '' || !/^\w+$/.test(table[i][0])) continue;

    data.tags[i] = table[i][0];
    data.months[i] = table[i].slice(1, 13);
    data.average[i] = table[i][14];
    data.total[i] = table[i][15];
  }

  return data;
}
