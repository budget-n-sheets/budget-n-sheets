function retrieveBackupInfo (uuid) {
  if (!CacheService2.get('user', uuid, 'boolean')) {
    showSessionExpired();
    return;
  }

  const address = computeDigest('SHA_1', 'settings_summary:' + uuid, 'UTF_8');
  const settings_summary = CacheService2.get('document', address, 'json');
  CacheService2.remove('document', address);
  return settings_summary;
}

function requestValidateBackup (uuid, file_id) {
  if (!CacheService2.get('user', uuid, 'boolean')) {
    showSessionExpired();
    return;
  }

  if (!isUserOwner(file_id)) {
    showDialogSetupRestore(uuid, 'No file with the given ID could be found, or you do not have permission to access it.');
    return;
  }

  const file = DriveApp.getFileById(file_id);
  const blob = file.getBlob();

  if (/:[0-9a-fA-F]+$/.test(blob.getDataAsString())) {
    processLegacyBackup_(uuid, file, file_id, blob);
    return;
  }

  let htmlTemplate = HtmlService.createTemplateFromFile('setup/restore/htmlEnterPassphrase');
  htmlTemplate = printHrefScriptlets(htmlTemplate);

  htmlTemplate.file_id = file_id;
  htmlTemplate.uuid = uuid;

  const htmlDialog = htmlTemplate.evaluate()
    .setWidth(281)
    .setHeight(127);

  SpreadsheetApp.getUi().showModalDialog(htmlDialog, 'Enter passphrase');
}

function processLegacyBackup_ (uuid, file, file_id, blob) {
  const parts = blob.getDataAsString().split(':');
  const sha = computeDigest('SHA_1', parts[0], 'UTF_8');

  if (sha !== parts[1]) {
    showDialogSetupRestore(uuid, 'The file is either not a supported file type or the file is corrupted.');
    return;
  }

  const string = base64DecodeWebSafe(parts[0], 'UTF_8');
  processBackup_(uuid, file, file_id, JSON.parse(string));

  CacheService2.put('user', uuid, 'boolean', true);
  showDialogSetupRestore(uuid, '');
}

function requestDevelopBackup (uuid, file_id, passphrase) {
  if (!CacheService2.get('user', uuid, 'boolean')) {
    showSessionExpired();
    return;
  }

  showDialogMessage('Add-on restore', 'Verifying backup...', 1);

  if (!isUserOwner(file_id)) {
    showDialogSetupRestore(uuid, 'No file with the given ID could be found, or you do not have permission to access it.');
    return;
  }

  const file = DriveApp.getFileById(file_id);
  const data = file.getBlob().getDataAsString();
  const decrypted = decryptBackup_(passphrase, data);

  if (decrypted == null) {
    showDialogSetupRestore(uuid, 'The passphrase is incorrect or the file is corrupted.');
    return;
  }

  const address = computeDigest(
    'SHA_1',
    uuid + file.getId() + SpreadsheetApp2.getActiveSpreadsheet().getId(),
    'UTF_8');
  CacheService2.put('user', address, 'string', passphrase, 180);

  processBackup_(uuid, file, file_id, decrypted);

  CacheService2.put('user', uuid, 'boolean', true);
  showDialogSetupRestore(uuid, '');
}

function unwrapBackup_ (uuid, blob, file_id) {
  const data = blob.getDataAsString();

  if (/:[0-9a-fA-F]+$/.test(data)) {
    const parts = data.split(':');

    const sha = computeDigest('SHA_1', parts[0], 'UTF_8');
    if (sha !== parts[1]) throw new Error("Hashes don't match.");

    return parts[0];
  }

  const address = computeDigest(
    'SHA_1',
    uuid + file_id + SpreadsheetApp2.getActiveSpreadsheet().getId(),
    'UTF_8');
  const passphrase = CacheService2.get('user', address, 'string');
  CacheService2.remove('user', address, 'string');

  if (passphrase == null) {
    showSessionExpired();
    return;
  }

  const decrypted = decryptBackup_(passphrase, data);
  if (decrypted == null) throw new Error('decryptBackup_(): Decryption failed.');

  return decrypted;
}

function decryptBackup_ (passphrase, backup) {
  try {
    const decoded = base64DecodeWebSafe(backup, 'UTF_8');
    const decrypted = sjcl.decrypt(passphrase, decoded);
    return JSON.parse(decrypted);
  } catch (err) {
    ConsoleLog.error(err);
  }
}

function processBackup_ (uuid, file, file_id, data) {
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

  const address = computeDigest('SHA_1', 'settings_summary:' + uuid, 'UTF_8');
  CacheService2.put('document', address, 'json', info);
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
