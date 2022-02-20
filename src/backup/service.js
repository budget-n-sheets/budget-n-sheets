function showDialogBackupSession () {
  if (!AppsScript.isInstalled()) return 2;
  if (!User2.isAdmin()) return 2;
  if (!Addon.isUpToDate()) return 2;

  const ui = SpreadsheetApp2.getUi();

  if (MailApp.getRemainingDailyQuota() === 0) {
    ui.alert(
      "Can't back up",
      "You don't have enought quota for Google Services. Try again later.",
      ui.ButtonSet.OK);
    return 1;
  }

  const jsZxcvbn = HtmlService.createHtmlOutputFromFile('zxcvbn/jsZxcvbn').getContent();
  const htmlOutput = HtmlService2.createTemplateFromFile('backup/htmlNewPassword')
    .assignReservedHref()
    .setScriptletValues({ jsZxcvbn: jsZxcvbn })
    .evaluate()
    .setHeight(421)
    .setWidth(281);

  ui.showModalDialog(htmlOutput, 'Enter password');
}

function backupService (password) {
  if (!FeatureFlag.getStatusOf('settings/backup')) return 2;
  if (!AppsScript.isInstalled()) return 2;
  if (!User2.isAdmin()) return 2;
  if (!Addon.isUpToDate()) return 2;
  if (!BackupUtils.checkPasswordPolicy(password)) return 1;

  showDialogMessage('Add-on backup', 'Backing up...', 1);

  const blob = SjclService.encrypt(
    password,
    'budget-n-sheets-' + Utilities.formatDate(Consts.date, 'GMT', 'yyyy-MM-dd-HH-mm-ss') + '.backup',
    JSON.stringify(new Backup().makeBackup())
  );

  BackupUtils.sendEmail(blob);

  SpreadsheetApp2.getUi().alert(
    'Add-on backup',
    'The backup was completed successfully.',
    SpreadsheetApp2.getUi().ButtonSet.OK);
  return 0;
}
