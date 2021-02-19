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
