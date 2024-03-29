/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

function askDeactivation () {
  if (!Addon.isInstalled()) {
    Addon.uninstall();
    onOpen();
    return true;
  }

  const ui = SpreadsheetApp2.getUi();

  if (!AddonUser.hasBaselinePermission()) {
    ui.alert(
      'Permission denied',
      "You don't have permission to deactivate the add-on.",
      ui.ButtonSet.OK);
    return;
  }

  const response1 = ui.alert(
    'Deactivate the add-on',
    'Before you deactivate the add-on we recommend\n' +
    'backing-up your data so that you can restore it later.\n\n' +

    'The deactivation affects only this spreadsheet:\n' +
    SpreadsheetApp2.getActive().spreadsheet.getName() + '\n\n' +

    'By deactivating the add-on:\n' +
    '- The spreadsheet is locked.\n' +
    '- Add-on features are disabled.\n' +
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

  Addon.uninstall();
  onOpen();

  ui.alert(
    'Deactivation complete',
    'The add-on was deactivated.',
    ui.ButtonSet.OK);

  return true;
}

function askResetSuggestions () {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(200)) return;

  const sheetUnique = SpreadsheetApp2.getActive().getSheetByName('_Unique');
  if (!sheetUnique) return;

  const num_acc = SettingsConst.get('number_accounts');

  let ruleDV = SpreadsheetApp.newDataValidation()
    .requireValueInRange(sheetUnique.getRange('A:A'), false)
    .setAllowInvalid(true)
    .build();
  let ruleTV = SpreadsheetApp.newDataValidation()
    .requireValueInRange(sheetUnique.getRange('C:C'), false)
    .setAllowInvalid(true)
    .build();

  let i = -1;
  while (++i < 12) {
    const sheetMm = SpreadsheetApp2.getActive().getSheetByName(Consts.month_name.short[i]);
    if (!sheetMm) continue;

    const height = sheetMm.getMaxRows() - 4;
    if (height < 1) continue;

    for (let k = 0; k <= num_acc; k++) {
      sheetMm.getRange(5, 2 + 5 * k, height, 1)
        .clearDataValidations()
        .setDataValidation(ruleDV);

      sheetMm.getRange(5, 4 + 5 * k, height, 1)
        .clearDataValidations()
        .setDataValidation(ruleTV);
    }
  }

  const sheetCards = SpreadsheetApp2.getActive().getSheetByName('Cards');
  if (!sheetCards) {
    lock.releaseLock();
    return;
  }

  const height = sheetCards.getMaxRows() - 5;
  if (height < 1) {
    lock.releaseLock();
    return;
  }

  ruleDV = SpreadsheetApp.newDataValidation()
    .requireValueInRange(sheetUnique.getRange('B:B'), false)
    .setAllowInvalid(true)
    .build();
  ruleTV = SpreadsheetApp.newDataValidation()
    .requireValueInRange(sheetUnique.getRange('D:D'), false)
    .setAllowInvalid(true)
    .build();

  i = -1;
  while (++i < 12) {
    sheetCards.getRange(6, 2 + 6 * i, height, 1)
      .clearDataValidations()
      .setDataValidation(ruleDV);

    sheetCards.getRange(6, 5 + 6 * i, height, 1)
      .clearDataValidations()
      .setDataValidation(ruleTV);
  }

  lock.releaseLock();
}

function askResetProtection () {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(200)) return;

  const spreadsheet = SpreadsheetApp2.getActive().spreadsheet;
  let sheet, ranges, range;
  let protections, protection;
  let n, i, j, k;

  const number_accounts = SettingsConst.get('number_accounts');

  for (i = 0; i < 12; i++) {
    sheet = spreadsheet.getSheetByName(Consts.month_name.short[i]);
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
    const rangeOff = sheet.getRange(5, 1, n, 4);
    for (k = 0; k < 1 + number_accounts; k++) {
      range = rangeOff.offset(0, 5 * k);
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

    const rangeOff1 = sheet.getRange(6, 1, n, 5);
    const rangeOff2 = sheet.getRange(2, 1, 1, 3);
    for (i = 0; i < 12; i++) {
      range = rangeOff1.offset(0, 6 * i);
      ranges.push(range);

      range = rangeOff2.offset(0, 6 * i);
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
  if (!AddonUser.hasBaselinePermission()) {
    Triggers.deleteAllUserTriggers();

    SpreadsheetApp2.getUi().alert(
      'Permission denied',
      "You don't have permission to reinstall the triggers.",
      SpreadsheetApp2.getUi().ButtonSet.OK);

    return 1;
  }

  TriggersService.restart();
}
