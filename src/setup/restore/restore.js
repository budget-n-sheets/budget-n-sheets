function retrieveBackupInfo (uuid) {
  if (!CacheService3.user().get(uuid)) {
    showSessionExpired();
    return;
  }

  const address = Utilities2.computeDigest('SHA_1', 'settings_summary:' + uuid, 'UTF_8');
  const settings_summary = CacheService3.document().get(address);
  CacheService3.document().remove(address);
  return settings_summary;
}

function requestValidateBackup (uuid, file_id) {
  if (!CacheService3.user().get(uuid)) {
    showSessionExpired();
    return;
  }

  if (!isUserOwner(file_id)) {
    showDialogSetupRestore(uuid, 'No file with the given ID could be found, or you do not have permission to access it.');
    return;
  }

  const file = DriveApp.getFileById(file_id);
  const data = file.getBlob().getDataAsString();

  if (/:[0-9a-fA-F]+$/.test(data)) {
    processLegacyBackup_(uuid, { file: file, id: file_id, name: file.getName() }, data);
    return;
  }

  const scriptlet = { file_id: file_id, uuid: uuid };
  const htmlOutput = HtmlService2.createTemplateFromFile('setup/restore/htmlEnterPassword')
    .assignReservedHref()
    .setScriptletValues(scriptlet)
    .evaluate()
    .setWidth(281)
    .setHeight(127);

  SpreadsheetApp2.getUi().showModalDialog(htmlOutput, 'Enter password');
}

function processLegacyBackup_ (uuid, file, data) {
  const parts = data.split(':');
  const sha = Utilities2.computeDigest('SHA_1', parts[0], 'UTF_8');

  if (sha !== parts[1]) {
    showDialogSetupRestore(uuid, 'The file is either not a supported file type or the file is corrupted.');
    return;
  }

  const string = Utilities2.base64DecodeWebSafe(parts[0], 'UTF_8');
  if (processBackup_(uuid, file, JSON.parse(string)) !== 0) {
    showDialogSetupRestore(uuid, 'Sorry, something went wrong. Try again in a moment.');
    return;
  }

  CacheService3.user().put(uuid, true);
  showDialogSetupRestore(uuid, '');
}

function requestDevelopBackup (uuid, file_id, password) {
  if (!CacheService3.user().get(uuid)) {
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
  const decrypted = decryptBackup_(password, data);

  if (decrypted == null) {
    showDialogSetupRestore(uuid, 'The password is incorrect or the file is corrupted.');
    return;
  }

  const address = Utilities2.computeDigest(
    'SHA_1',
    uuid + file.getId() + SpreadsheetApp2.getActiveSpreadsheet().getId(),
    'UTF_8');
  CacheService3.user().put(address, password, 180);

  if (processBackup_(uuid, { file: file, id: file_id, name: file.getName() }, decrypted) !== 0) {
    showDialogSetupRestore(uuid, 'Sorry, something went wrong. Try again in a moment.');
    return;
  }

  CacheService3.user().put(uuid, true);
  showDialogSetupRestore(uuid, '');
}

function unwrapBackup_ (uuid, blob, file_id) {
  const data = blob.getDataAsString();

  if (/:[0-9a-fA-F]+$/.test(data)) {
    const parts = data.split(':');

    const sha = Utilities2.computeDigest('SHA_1', parts[0], 'UTF_8');
    if (sha !== parts[1]) throw new Error("Hashes don't match.");

    return parts[0];
  }

  const address = Utilities2.computeDigest(
    'SHA_1',
    uuid + file_id + SpreadsheetApp2.getActiveSpreadsheet().getId(),
    'UTF_8');
  const password = CacheService3.user().get(address);
  CacheService3.user().remove(address);

  if (password == null) {
    showSessionExpired();
    return;
  }

  const decrypted = decryptBackup_(password, data);
  if (decrypted == null) throw new Error('decryptBackup_(): Decryption failed.');

  return decrypted;
}

function decryptBackup_ (password, backup) {
  try {
    const decoded = Utilities2.base64DecodeWebSafe(backup, 'UTF_8');
    const decrypted = sjcl.decrypt(password, decoded);
    return JSON.parse(decrypted);
  } catch (err) {
    LogLog.error(err);
  }
}

function processBackup_ (uuid, file, data) {
  if (!FeatureFlag.getStatusOf('setup/restore')) return 1;

  const settings_candidate = {
    file_id: file.id,
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

  PropertiesService3.document().setProperty('settings_candidate', settings_candidate);

  const info = {
    file_id: file.id,
    file_name: file.name,
    date_created: new Date(data.backup.date_request).toString(),

    spreadsheet_title: data.backup.spreadsheet_title,
    financial_year: data.const_properties.financial_year,
    initial_month: Consts.month_name.long[data.user_settings.initial_month],
    decimal_places: data.spreadsheet_settings.decimal_places,
    number_accounts: data.const_properties.number_accounts,

    financial_calendar: '',

    tags: 0,
    accounts: '',
    cards: ''
  };

  let list, i;

  if (data.user_settings.sha256_financial_calendar) {
    const calendars = Calendar.listAllCalendars();
    for (const sha1 in calendars) {
      const digest = Utilities2.computeDigest('SHA_256', calendars[sha1].id, 'UTF_8');

      if (digest === data.sha256_financial_calendar) {
        info.financial_calendar = calendars[sha1].name;
        break;
      }
    }

    if (!info.financial_calendar) info.financial_calendar = '<i>Google Calendar not found or you do not have permission to access it.</i>';
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

  const address = Utilities2.computeDigest('SHA_1', 'settings_summary:' + uuid, 'UTF_8');
  CacheService3.document().put(address, info);
  return 0;
}
