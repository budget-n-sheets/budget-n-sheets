function setupRestore_ (fileId) {
  console.time('restore/time');

  const parts = DriveApp.getFileById(fileId)
    .getBlob()
    .getAs('text/plain')
    .getDataAsString()
    .split(':');

  const webSafeCode = parts[0];
  const sha = computeDigest('SHA_1', webSafeCode, 'UTF_8');
  if (sha !== parts[1]) return 3;

  const string = base64DecodeWebSafe(webSafeCode, 'UTF_8');
  const backup = JSON.parse(string);

  const list_acc = [];
  for (var i in backup.db_tables.accounts) {
    list_acc.push(backup.db_tables.accounts[i].name);
  }

  SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();

  setupValidate_();

  SETUP_SETTINGS = {
    spreadsheet_name: backup.spreadsheet_title,
    financial_year: backup.const_properties.financial_year,
    init_month: backup.user_settings.initial_month,
    number_accounts: backup.const_properties.number_accounts,
    list_acc: list_acc,
    decimal_separator: true
  };

  setupPrepare_();
  setupParts_();

  PropertiesService2.setProperty('document', 'class_version2', 'json', backup.class_version2);

  if (bsSignSetup_()) throw new Error('Failed to sign document.');

  SPREADSHEET.setRecalculationInterval(SpreadsheetApp.RecalculationInterval.HOUR);
  SPREADSHEET.setActiveSheet(SPREADSHEET.getSheetByName('Summary'));
  PropertiesService2.setProperty('document', 'is_installed', 'boolean', true);

  showDialogSetupEnd();
  onOpen();

  SPREADSHEET = null;
  SETUP_SETTINGS = null;
  console.timeEnd('restore/time');
}
