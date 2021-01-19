function retrieveBackupInfo () {
  const backup_candidate = CacheService2.get('document', 'backup_candidate', 'json');
  CacheService2.remove('document', 'backup_candidate');
  return backup_candidate;
}

function requestValidateBackup (file_id) {
  const status = validateBackup_(file_id);

  let msg = '';

  switch (status) {
    case 0:
      break;
    case 1:
      msg = 'Sorry, something went wrong. Try again in a moment.';
      break;
    case 2:
      msg = 'No file with the given ID could be found, or you do not have permission to access it.';
      break;
    case 3:
      msg = 'The file is either not a supported file type or the file is corrupted.';
      break;
    case 4:
      msg = 'The passphrase is incorrect or the file is corrupted.';
      break;

    default:
      throw new Error('requestValidateBackup(): Invalid switch case.' + rr);
  }


  showDialogSetupRestore(status, msg);
}

function validateBackup_ (file_id) {
  if (isInstalled_()) return 1;

  CacheService2.remove('document', 'backup_candidate');
  showDialogMessage('Add-on restore', 'Verifying the backup...', 1);

  let file, sha, parts;

  try {
    file = DriveApp.getFileById(file_id);

    const owner = file.getOwner().getEmail();
    const user = Session.getEffectiveUser().getEmail();

    if (owner !== user) return 2;
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }

  const data = developBackup_(file);
  if (typeof data === 'number') return data;

  const settings_candidate = {
    file_id: file_id,
    list_acc: [],
    spreadsheet_title: data.backup.spreadsheet_title,
    decimal_places: data.spreadsheet_settings.decimal_places,
    financial_year: data.const_properties.financial_year,
    initial_month: data.user_settings.initial_month,
    number_accounts: data.const_properties.number_accounts
  };

  for (const i in data.db_tables.accounts) {
    settings_candidate.list_acc.push(data.db_tables.accounts[i].name);
  }

  PropertiesService2.setProperty('document', 'settings_candidate', 'json', settings_candidate);

  const info = {
    file_id: file_id,
    file_name: file.getName(),
    date_created: new Date(data.backup.date_request).toString(),

    spreadsheet_title: data.backup.spreadsheet_title,
    financial_year: data.const_properties.financial_year,
    initial_month: MONTH_NAME.long[data.user_settings.initial_month],
    decimal_places: data.spreadsheet_settings.decimal_places,
    number_accounts: data.const_properties.number_accounts,

    financial_calendar: '',

    tags: 0,
    accounts: '',
    cards: ''
  };

  let digest, list, i;

  if (data.user_settings.sha256_financial_calendar) {
    const calendars = getAllOwnedCalendars();
    for (i = 0; i < calendars.id.length; i++) {
      digest = computeDigest('SHA_256', calendars.id[i], 'UTF_8');
      if (digest === data.sha256_financial_calendar) {
        info.financial_calendar = calendars.name[i];
        break;
      }
    }
    if (i === calendars.id.length) info.financial_calendar = '<i>Google Calendar not found or you do not have permission to access it.</i>';
  }

  info.tags = data.tags.length;
  if (info.tags > 0) info.tags = 'Up to ' + info.tags + ' tags found.';

  list = [];
  for (i in data.db_tables.accounts) {
    list.push(data.db_tables.accounts[i].name);
  }
  info.accounts = list.join(', ');

  list = [];
  for (i in data.db_tables.cards) {
    list.push(data.db_tables.cards[i].name);
  }
  if (list.length > 0) {
    info.cards = list.join(', ');
  } else {
    info.cards = 'No cards found.';
  }

  CacheService2.put('document', 'backup_candidate', 'json', info);

  return 0;
}

function developBackup_ (file) {
  const blob = file.getBlob();
  const data = blob.getDataAsString();
  const contentType = blob.getContentType();

  if (contentType === 'text/plain') {
    const parts = data.split(':');
    const sha = computeDigest('SHA_1', parts[0], 'UTF_8');

    if (sha !== parts[1]) return 3;

    const string = base64DecodeWebSafe(parts[0], 'UTF_8');
    return JSON.parse(string);
  }

  if (contentType === 'application/octet-stream') {
    const ui = SpreadsheetApp.getUi();
    const passphrase = ui.prompt(
      'Budget n Sheets Restore',
      'Enter passphrase:',
      ui.ButtonSet.OK_CANCEL);
    if (passphrase.getSelectedButton() === ui.Button.CANCEL) return 0;

    let decrypted = null;

    try {
      decrypted = sjcl.decrypt(passphrase.getResponseText(), data);
    } catch (err) {
      ConsoleLog.error(err);
      return 4;
    }
    const parts = decrypted.split(':');
    const test_sha = computeDigest('SHA_256', parts[0], 'UTF_8');

    if (test_sha !== parts[1]) return 4;

    const string = base64DecodeWebSafe(parts[0], 'UTF_8');
    return JSON.parse(string);
  }

  return 3;
}

function restoreFromBackup_ (backup) {
  let digest, i;

  if (backup.user_settings.sha256_financial_calendar) {
    const calendars = getAllOwnedCalendars();
    for (i = 0; i < calendars.id.length; i++) {
      digest = computeDigest('SHA_256', calendars.id[i], 'UTF_8');
      if (digest === backup.user_settings.sha256_financial_calendar) {
        setUserSettings_('financial_calendar', calendars.id[i]);
        setUserSettings_('post_day_events', backup.user_settings.post_day_events);
        setUserSettings_('cash_flow_events', backup.user_settings.cash_flow_events);
        break;
      }
    }
  }

  restoreTables_(backup);
  restoreMonths_(backup);
  restoreCards_(backup);
  restoreTags_(backup);

  SpreadsheetApp.flush();
}

function restoreTables_ (backup) {
  let i;

  const db_tables = getDbTables_();

  for (i in backup.db_tables.accounts) {
    backup.db_tables.accounts[i].id = db_tables.accounts.ids[i];
    tablesService('set', 'account', backup.db_tables.accounts[i]);
  }

  for (i in backup.db_tables.cards) {
    backup.db_tables.cards[i].aliases = backup.db_tables.cards[i].aliases.join(',');
    tablesService('set', 'addcard', backup.db_tables.cards[i]);
  }
}

function restoreCards_ (backup) {
  let max, mm;

  const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('Cards');
  max = sheet.getMaxRows() - 5;

  mm = -1;
  while (++mm < 12) {
    if (backup.cards[mm].length === 0) continue;

    while (max < backup.cards[mm].length) {
      addBlankRows_('Cards');
      max += 400;
    }

    sheet.getRange(6, 1 + 6 * mm, backup.cards[mm].length, 5).setValues(backup.cards[mm]);
  }
}

function restoreMonths_ (backup) {
  let sheet, max, mm, k;

  const num_acc = backup.const_properties.number_accounts;

  mm = -1;
  while (++mm < 12) {
    if (backup.ttt[mm] == null) continue;

    sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName(MONTH_NAME.short[mm]);
    max = sheet.getMaxRows() - 4;

    for (k = 0; k < num_acc + 1; k++) {
      if (backup.ttt[mm][k] == null) continue;
      if (backup.ttt[mm][k].length === 0) continue;

      while (max < backup.ttt[mm][k].length) {
        addBlankRows_(MONTH_NAME.short[mm]);
        max += 400;
      }

      sheet.getRange(5, 1 + 5 * k, backup.ttt[mm][k].length, 4).setValues(backup.ttt[mm][k]);
    }
  }
}

function restoreTags_ (backup) {
  const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('Tags');

  let max = sheet.getMaxRows();
  while (max < backup.tags.length) {
    addBlankRows_('Tags');
    max += 400;
  }

  if (backup.tags.length > 0) {
    sheet.getRange(2, 1, backup.tags.length, 5).setValues(backup.tags);
  }
}
