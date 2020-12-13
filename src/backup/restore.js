function validateBackup (fileId) {
  if (isInstalled_()) return 1;

  let file, sha, parts;

  try {
    file = DriveApp.getFileById(fileId);

    const owner = file.getOwner().getEmail();
    const user = Session.getEffectiveUser().getEmail();

    if (owner !== user) return 2;
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }

  try {
    const blob = file.getBlob().getAs('text/plain');
    const raw = blob.getDataAsString();

    parts = raw.split(':');
    sha = computeDigest('SHA_1', parts[0], 'UTF_8');
  } catch (err) {
    ConsoleLog.error(err);
    return 3;
  }
  if (sha !== parts[1]) return 3;

  const webSafeCode = parts[0];
  const string = base64DecodeWebSafe(webSafeCode, 'UTF_8');
  const data = JSON.parse(string);

  PropertiesService2.setProperty('document', 'settings_candidate', 'json', { backup: data, file_id: fileId });

  const info = {
    file_name: file.getName(),
    date_created: new Date(data.backup.date_request).toString(),

    spreadsheet_title: data.backup.spreadsheet_title,
    financial_year: data.const_properties.financial_year,
    initial_month: MN_FULL[data.user_settings.initial_month],
    decimal_places: data.spreadsheet_settings.decimal_places,
    number_accounts: data.const_properties.number_accounts,

    financial_calendar: '',

    tags: 0,
    accounts: '',
    cards: ''
  };

  var digest, list, i;

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

  return info;
}

function restoreFromBackup_ (backup) {
  var digest, i;

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

  try {
    restoreTables_(backup);
  } catch (err) {
    ConsoleLog.error(err);
  }

  try {
    restoreMonths_(backup);
  } catch (err) {
    ConsoleLog.error(err);
  }

  try {
    restoreCards_(backup);
  } catch (err) {
    ConsoleLog.error(err);
  }

  try {
    restoreTags_(backup);
  } catch (err) {
    ConsoleLog.error(err);
  }

  SpreadsheetApp.flush();
}

function restoreTables_ (backup) {
  var i;

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
  var max, mm;

  const sheet = SPREADSHEET.getSheetByName('Cards');
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
  var sheet, max, mm, k;

  const num_acc = backup.const_properties.number_accounts;

  mm = -1;
  while (++mm < 12) {
    if (backup.ttt[mm] == null) continue;

    sheet = SPREADSHEET.getSheetByName(MN_SHORT[mm]);
    max = sheet.getMaxRows() - 4;

    for (k = 0; k < num_acc + 1; k++) {
      if (backup.ttt[mm][k] == null) continue;
      if (backup.ttt[mm][k].length === 0) continue;

      while (max < backup.ttt[mm][k].length) {
        addBlankRows_(MN_SHORT[mm]);
        max += 400;
      }

      sheet.getRange(5, 1 + 5 * k, backup.ttt[mm][k].length, 4).setValues(backup.ttt[mm][k]);
    }
  }
}

function restoreTags_ (backup) {
  const sheet = SPREADSHEET.getSheetByName('Tags');

  var max = sheet.getMaxRows();
  while (max < backup.tags.length) {
    addBlankRows_('Tags');
    max += 400;
  }

  if (backup.tags.length > 0) {
    sheet.getRange(2, 1, backup.tags.length, 5).setValues(backup.tags);
  }
}
