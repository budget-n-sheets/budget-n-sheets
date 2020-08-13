function setupRestore_ (fileId) {
  console.time('restore/time');

  var i;
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
    spreadsheet_name: backup.backup.spreadsheet_title,
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

  restoreFromBackup_(backup);

  showDialogSetupEnd();
  onOpen();

  SPREADSHEET = null;
  SETUP_SETTINGS = null;
  console.timeEnd('restore/time');
}

function restoreFromBackup_ (backup) {
  var sheet, sheetCards;
  var digest, max1, max2, mm, i, k;

  const num_acc = backup.const_properties.number_accounts;

  if (backup.user_settings.sha256_financial_calendar) {
    const calendars = getAllOwnedCalendars();
    for (i = 0; i < calendars.id.length; i++) {
      digest = computeDigest('SHA_256', calendars.id[i], 'UTF_8');
      if (digest === backup.user_settings.sha256_financial_calendar) {
        setUserSettings_('financial_calendar', calendars.id[i]);
        break;
      }
    }
  }

  const db_tables = getDbTables_();

  for (i in backup.db_tables.accounts) {
    backup.db_tables.accounts[i].id = db_tables.accounts.ids[i];
    tablesService('set', 'account', backup.db_tables.accounts[i]);
  }

  for (i in backup.db_tables.cards) {
    backup.db_tables.cards[i].aliases = backup.db_tables.cards[i].aliases.join(',');
    tablesService('set', 'addcard', backup.db_tables.cards[i]);
  }

  sheetCards = SPREADSHEET.getSheetByName('Cards');
  max2 = sheetCards.getMaxRows() - 5;

  mm = -1;
  while (++mm < 12) {
    while (max2 < backup.cards[mm].length) {
      addBlankRows_('Cards');
      max2 += 400;
    }

    if (backup.cards[mm].length > 0) {
      sheetCards.getRange(6, 1 + 6 * mm, backup.cards[mm].length, 5).setValues(backup.cards[mm]);
    }

    if (backup.ttt[mm] == null) continue;
    sheet = SPREADSHEET.getSheetByName(MN_SHORT[mm]);
    max1 = sheet.getMaxRows() - 4;

    for (k = 0; k < num_acc + 1; k++) {
      if (backup.ttt[mm][k] == null) continue;
      if (backup.ttt[mm][k].length === 0) continue;

      while (max1 < backup.ttt[mm][k].length) {
        addBlankRows_(MN_SHORT[mm]);
        max1 += 400;
      }

      sheet.getRange(5, 1 + 5 * k, backup.ttt[mm][k].length, 4).setValues(backup.ttt[mm][k]);
    }
  }

  SpradsheetApp.flush();
}
