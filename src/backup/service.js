function showDialogBackupSession () {
  if (!AppsScript.isInstalled()) return 2;
  if (!User2.isAdmin()) return 2;
  if (isScriptUpToDate_() !== 1) return 2;

  const ui = SpreadsheetApp2.getUi();

  if (MailApp.getRemainingDailyQuota() === 0) {
    ui.alert(
      "Can't back up",
      "You don't have enought quota for Google Services. Try again later.",
      ui.ButtonSet.OK);
    return 1;
  }

  const htmlOutput = HtmlService2.createTemplateFromFile('backup/htmlNewPassword')
    .assignReservedHref()
    .evaluate()
    .setHeight(443)
    .setWidth(281);

  ui.showModalDialog(htmlOutput, 'Enter password');
}

function backupService (password) {
  if (!FeatureFlag.getStatusOf('settings/backup')) return 2;
  if (!AppsScript.isInstalled()) return 2;
  if (!User2.isAdmin()) return 2;
  if (isScriptUpToDate_() !== 1) return 2;
  if (testPasswordPolicy(password)) return 1;

  const ui = SpreadsheetApp2.getUi();

  showDialogMessage('Add-on backup', 'Backing up...', 1);
  backupRequest_(password);

  ui.alert(
    'Add-on backup',
    'The backup was completed successfully.',
    ui.ButtonSet.OK);
  return 0;
}
