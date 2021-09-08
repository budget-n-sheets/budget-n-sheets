function toolUpdateCashFlow () {
  toolPickerUi_('UpdateCashFlow');
}

function toolForwardInstallments () {
  toolPickerUi_('ForwardInstallments');
}

function toolPickerUi_ (select) {
  switch (select) {
    case 'UpdateCashFlow':
    case 'ForwardInstallments':
      break;

    default:
      throw new Error('Switch case is default.');
  }

  if (toolPicker_(select) !== 0) {
    SpreadsheetApp2.getUi().alert(
      'Add-on is busy',
      'The add-on is busy. Try again in a moment.',
      SpreadsheetApp2.getUi().ButtonSet.OK);
  }
}

function toolPicker_ (select, value) {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(200)) return 1;

  switch (select) {
    case 'UpdateCashFlow':
      validateUpdateCashFlow_();
      break;
    case 'UpdateCashFlowMm':
      if (UpdateService.checkAndUpdate()) break;
      updateCashFlow_(value);
      break;
    case 'ForwardInstallments':
      validateForwardInstallments_();
      break;

    default:
      throw new Error('Switch case is default.');
  }

  lock.releaseLock();
  return 0;
}
