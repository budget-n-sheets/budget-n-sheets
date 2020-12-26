function askOptimizeAll () {
  switchActivity_('suspend');
}

function askSetRecalculation () {
  SpreadsheetApp2.getActiveSpreadsheet().setRecalculationInterval(SpreadsheetApp.RecalculationInterval.HOUR);
}

function rollOperationMode_ (mode) {
  const hour = 2 + randomInteger(4);
  let trigger;

  stopTrigger_('timeBased');
  Utilities.sleep(1000);
  startTrigger_('timeBased');

  console.log('mode/' + mode);
  setSpreadsheetSettings_('operation_mode', mode);
}

function askDeactivation () {
  if (!isInstalled_()) {
    uninstall_();
    onOpen();
    return true;
  }

  const ui = SpreadsheetApp.getUi();

  if (!isUserAdmin_()) {
    ui.alert(
      'Permission denied',
      "You don't have permission to deactivate the add-on.",
      ui.ButtonSet.OK);
    return;
  }

  const response1 = ui.alert(
    'Deactivate the add-on',
    'The deactivation affects only this spreadsheet: ' + SpreadsheetApp2.getActiveSpreadsheet().getName() + '.\n\n' +
    'By deactivating the add-on:\n' +
    '- All add-on features are disabled.\n' +
    '- Updates and maintenance cease.\n' +
    '- Data and functions are unaffected.\n' +
    '- This action cannot be undone.\n\n' +
    'For more information, visit the wiki.\n' +
    'Click OK to continue.',
    ui.ButtonSet.OK_CANCEL);
  if (response1 !== ui.Button.OK) return;

  const response2 = ui.alert(
    'Deactivate the add-on?',
    "You can't undo this action!",
    ui.ButtonSet.YES_NO);
  if (response2 !== ui.Button.YES) return;

  uninstall_(true);
  onOpen();

  ui.alert(
    'Deactivation complete',
    'The add-on was deactivated.',
    ui.ButtonSet.OK);

  console.log('deactivate');
  return true;
}

function askResetProtection () {
  const lock = LockService.getDocumentLock();
  try {
    lock.waitLock(200);
  } catch (err) {
    return;
  }

  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  let sheet, ranges, range;
  let protections, protection;
  let n, i, j, k;

  number_accounts = getConstProperties_('number_accounts');

  for (i = 0; i < 12; i++) {
    sheet = spreadsheet.getSheetByName(MN_SHORT[i]);
    if (!sheet) continue;

    n = sheet.getMaxRows() - 4;
    if (n < 1) continue;
    if (sheet.getMaxColumns() < 5 * (1 + number_accounts)) continue;

    protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
    for (j = 0; j < protections.length; j++) {
      protection = protections[j];
      if (protection.canEdit()) protection.remove();
    }

    ranges = [];
    for (k = 0; k < 1 + number_accounts; k++) {
      range = sheet.getRange(5, 1 + 5 * k, n, 4);
      ranges.push(range);
    }

    sheet.protect()
      .setUnprotectedRanges(ranges)
      .setWarningOnly(true);
  }

  sheet = spreadsheet.getSheetByName('Cards');

  if (sheet) n = sheet.getMaxRows() - 5;
  else n = -1;

  if (n > 0 && sheet.getMaxColumns() >= 72) {
    protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
    for (j = 0; j < protections.length; j++) {
      protection = protections[j];
      if (protection.canEdit()) protection.remove();
    }

    ranges = [];

    for (i = 0; i < 12; i++) {
      range = sheet.getRange(6, 1 + 6 * i, n, 5);
      ranges.push(range);

      range = sheet.getRange(2, 1 + 6 * i, 1, 3);
      ranges.push(range);
    }

    sheet.protect()
      .setUnprotectedRanges(ranges)
      .setWarningOnly(true);
  }

  sheet = spreadsheet.getSheetByName('Tags');

  if (sheet) n = sheet.getMaxRows() - 1;
  else n = -1;

  if (n > 0) {
    protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
    for (j = 0; j < protections.length; j++) {
      protection = protections[j];
      if (protection.canEdit()) protection.remove();
    }

    range = sheet.getRange(2, 1, n, 5);
    sheet.protect()
      .setUnprotectedRanges([range])
      .setWarningOnly(true);
  }

  lock.releaseLock();
}

function askReinstallTriggersUi () {
  if (!isUserAdmin_()) {
    SpreadsheetApp.getUi().alert(
      'Permission denied',
      "You don't have permission to reinstall the triggers.",
      SpreadsheetApp.getUi().ButtonSet.OK);
    return 1;
  }

  reinstallTriggers_();
}

function reinstallTriggers_ () {
  if (!isInstalled_()) return;

  const financial_year = getConstProperties_('financial_year');

  deleteAllTriggers_();
  Utilities.sleep(1000);

  startTrigger_('onOpen');
  startTrigger_('onEdit');
  startTrigger_('timeBased');

  if (DATE_NOW.getFullYear() === financial_year) setSpreadsheetSettings_('operation_mode', 'active');
  else setSpreadsheetSettings_('operation_mode', 'passive');
}
