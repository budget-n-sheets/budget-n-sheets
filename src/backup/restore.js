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
