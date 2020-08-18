function validateBackup (fileId) {
  if (isInstalled_()) return 1;

  const lock = LockService.getDocumentLock();
  try {
    lock.waitLock(200);
  } catch (err) {
    return 1;
  }

  if (CacheService2.get('user', 'OAuthToken', 'string') == null) return 1;
  CacheService2.remove('user', 'OAuthToken');
  lock.releaseLock();

  try {
    const file = DriveApp.getFileById(fileId);

    const owner = file.getOwner().getEmail();
    const user = Session.getEffectiveUser().getEmail();

    if (owner !== user) return 2;
  } catch (err) {
    console.log(err);
    return 2;
  }

  const blob = file.getBlob().getAs('text/plain');
  const raw = blob.getDataAsString();

  const parts = raw.split(':');
  const sha = computeDigest('SHA_1', parts[0], 'UTF_8');
  if (sha !== parts[1]) return 3;

  const webSafeCode = parts[0];
  const string = base64DecodeWebSafe(webSafeCode, 'UTF_8');
  const data = JSON.parse(string);

  const info = {
    file_name: file.getName(),
    date_created: new Date(data.backup.date_request).toString(),

    spreadsheet_title: data.backup.spreadsheet_title,
    financial_year: data.const_properties.financial_year,
    initial_month: MN_FULL[data.user_settings.initial_month],
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
  if (info.tags > 0) info.tags = 'Up to ' + info.tags + ' tags may be present.';

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
    info.cards = 'No cards present.';
  }

  return info;
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

  SpreadsheetApp.flush();

  sheet = SPREADSHEET.getSheetByName('Tags');

  max1 = sheet.getMaxRows();
  while (max1 < backup.tags.length) {
    addBlankRows_('Tags');
    max1 += 400;
  }

  if (backup.tags.length > 0) {
    sheet.getRange(2, 1, backup.tags.length, 5).setValues(backup.tags);
    SpreadsheetApp.flush();
  }
}
