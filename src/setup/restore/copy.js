function restrieveSpreadsheetInfo (uuid) {
  if (!CacheService2.get('user', uuid, 'boolean')) {
    showSessionExpired();
    return;
  }

  const address = computeDigest('SHA_1', 'settings_summary:' + uuid, 'UTF_8');
  const settings_summary = CacheService2.get('document', address, 'json');
  CacheService2.remove('document', address);
  return settings_summary;
}

function requestValidateSpreadsheet (uuid, file_id) {
  if (!CacheService2.get('user', uuid, 'boolean')) {
    showSessionExpired();
    return;
  }

  showDialogMessage('Add-on restore', 'Verifying the spreadsheet...', 1);

  if (validateSpreadsheet_(uuid, file_id) !== 0) {
    showDialogSetupCopy(uuid, 'Sorry, it was not possible to verify the spreadsheet.');
    return;
  }

  if (processSpreadsheet_(uuid, file_id) !== 0) {
    showDialogSetupCopy(uuid, 'Sorry, something went wrong. Try again in a moment.');
    return;
  }

  CacheService2.put('user', uuid, 'boolean', true);
  showDialogSetupCopy(uuid, '');
}

function validateSpreadsheet_ (uuid, file_id) {
  if (!isUserOwner(file_id)) {
    showDialogSetupCopy(uuid, 'No spreadsheet with the given ID could be found, or you do not have permission to access it.');
    return;
  }

  const file = DriveApp.getFileById(file_id);
  if (file.getMimeType() !== MimeType.GOOGLE_SHEETS) {
    showDialogSetupCopy(uuid, 'Sorry, it was not possible to verify the spreadsheet.');
    return;
  }

  const inner_key = getInnerKey_();
  if (inner_key === 1) {
    showDialogSetupCopy(uuid, 'Sorry, something went wrong. Try again in a moment.');
    return;
  }

  const spreadsheet = SpreadsheetApp.openById(file_id);
  let list;

  try {
    list = spreadsheet.createDeveloperMetadataFinder()
      .withVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
      .withKey('bs_sig')
      .find();
  } catch (err) {
    ConsoleLog.error(err);
    showDialogSetupCopy(uuid, 'Sorry, something went wrong. Try again in a moment.');
    return;
  }

  if (list.length === 0) {
    showDialogSetupCopy(uuid, 'Sorry, it was not possible to verify the spreadsheet.');
    return;
  }

  const metadata = JSON.parse(list[0].getValue());

  const hmac = computeHmacSignature('SHA_256', metadata.encoded, inner_key, 'UTF_8');
  if (hmac !== metadata.hmac) {
    showDialogSetupCopy(uuid, 'Sorry, it was not possible to verify the spreadsheet.');
    return;
  }

  const webSafeCode = metadata.encoded;
  const string = base64DecodeWebSafe(webSafeCode, 'UTF_8');
  const data = JSON.parse(string);

  if (data.admin_id !== getUserId_()) {
    showDialogSetupCopy(uuid, 'No spreadsheet with the given ID could be found, or you do not have permission to access it.');
    return;
  }

  return 0;
}

function processSpreadsheet_ (uuid, file_id) {
  if (!getFeatureFlagStatus_('setup/copy')) return 1;

  const spreadsheet = SpreadsheetApp.openById(file_id);

  let sheet, values, cols;
  let list;

  const w_ = TABLE_DIMENSION.width;

  const info = {
    file_id: file_id,
    file_name: spreadsheet.getName(),
    file_url: spreadsheet.getUrl(),
    last_updated: DriveApp.getFileById(file_id).getLastUpdated().toString(),
    spreadsheet_title: spreadsheet.getName(),

    financial_year: DATE_NOW.getFullYear(),
    initial_month: DATE_NOW.getMonth(),

    accounts: [],
    cards: [],
    tags: 0
  };

  sheet = spreadsheet.getSheetByName('_Settings');
  if (!sheet) return 1;

  values = sheet.getRange(2, 2, 7, 1).getValues();

  info.financial_year = Number(values[0][0]);
  info.initial_month = Number(values[2][0]) - 1;
  info.tags = Number(values[5][0]);

  sheet = spreadsheet.getSheetByName('_Backstage');
  if (!sheet) return 1;

  cols = sheet.getMaxColumns();
  values = sheet.getRange(1, 2, 1, cols - 1).getValues();

  cols = cols - 1 - 12 * w_;
  const num_accs = (cols - (cols % w_)) / w_;
  if (cols === 0) return 1;

  list = [];
  for (let i = 0; i < num_accs; i++) {
    list[i] = values[0][w_ + w_ * i];
  }
  info.accounts = list;

  list = [];
  cols = 2 * w_ + num_accs * w_;
  for (let i = 0; i < 10; i++) {
    if (values[0][cols + w_ * i] !== '') {
      const matches = values[0][cols + w_ * i].match(/\w+/g);
      if (matches) list.push(matches);
    }
  }
  info.cards = list;

  PropertiesService2.setProperty('document', 'settings_candidate', 'json', info);

  info.initial_month = MONTH_NAME.long[info.initial_month];

  info.accounts = info.accounts.join(', ');
  for (let i = 0; i < info.cards.length; i++) {
    info.cards[i] = info.cards[i][0];
  }
  info.cards = info.cards.join(', ');

  if (info.tags > 0) info.tags = 'Up to ' + info.tags + ' tag(s) found.';
  else info.tags = '-';

  const address = computeDigest('SHA_1', 'settings_summary:' + uuid, 'UTF_8');
  CacheService2.put('document', address, 'json', info);
  return 0;
}

function restoreFromSpreadsheet_ (file_id) {
  const spreadsheet = SpreadsheetApp.openById(file_id);

  copyTables_(spreadsheet);
  copyMonths_(spreadsheet);
  copyCards_(spreadsheet);
  copyTags_(spreadsheet);
  copySettings_(spreadsheet);
}

function copyTables_ (spreadsheet) {
  const db_tables = getDbTables_();
  let metadata;

  metadata = spreadsheet.createDeveloperMetadataFinder()
    .withVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
    .withKey('db_accounts')
    .find();
  metadata = JSON.parse(metadata[0].getValue());

  for (let i = 0; i < metadata.length; i++) {
    metadata[i].id = db_tables.accounts.ids[i];
    tablesService('set', 'account', metadata[i]);
  }

  metadata = spreadsheet.createDeveloperMetadataFinder()
    .withVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
    .withKey('db_cards')
    .find();
  metadata = JSON.parse(metadata[0].getValue());

  for (let i = 0; i < metadata.length; i++) {
    metadata[i].aliases = metadata[i].aliases.join(',');
    tablesService('set', 'addcard', metadata[i]);
  }

  SpreadsheetApp.flush();
}

function copyMonths_ (spreadsheet) {
  const number_accounts = getConstProperties_('number_accounts');

  let mm = -1;
  while (++mm < 12) {
    const source = spreadsheet.getSheetByName(MONTH_NAME.short[mm]);
    if (!source) continue;

    const last = source.getLastRow();
    if (last < 5) continue;

    const destination = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName(MONTH_NAME.short[mm]);

    let max = destination.getMaxRows();
    while (max < last) {
      blankRows_(MONTH_NAME.short[mm]);
      max += 400;
    }

    const values = source.getRange(5, 1, last - 4, 5 + 5 * number_accounts).getValues();
    destination.getRange(5, 1, last - 4, 5 + 5 * number_accounts).setValues(values);
  }
}

function copyCards_ (spreadsheet) {
  const source = spreadsheet.getSheetByName('Cards');
  if (!source) return;

  const last = source.getLastRow();
  if (last < 6) return;

  const destination = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('Cards');

  let max = destination.getMaxRows();
  while (max < last) {
    blankRows_('Cards');
    max += 400;
  }

  const values = source.getRange(6, 1, last - 5, 6 * 12).getValues();
  destination.getRange(6, 1, last - 5, 6 * 12).setValues(values);
}

function copyTags_ (spreadsheet) {
  const destination = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('Tags');
  const source = spreadsheet.getSheetByName('Tags');
  if (!source) return;

  const last = source.getLastRow();
  if (last < 2) return;

  let max = destination.getMaxRows();
  while (max < last) {
    blankRows_('Tags');
    max += 400;
  }

  const values = source.getRange(2, 1, last - 1, 5).getValues();
  destination.getRange(2, 1, last - 1, 5).setValues(values);
}

function copySettings_ (spreadsheet) {
  const list = spreadsheet.createDeveloperMetadataFinder()
    .withVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
    .withKey('user_settings')
    .find();
  if (list.length === 0) return;

  const metadata = JSON.parse(list[0].getValue());
  if (metadata.financial_calendar_sha256 === '') return;

  const calendars = getAllOwnedCalendars();
  for (let i = 0; i < calendars.id.length; i++) {
    const digest = computeDigest('SHA_256', calendars.id[i], 'UTF_8');

    if (digest === metadata.financial_calendar_sha256) {
      setUserSettings_('financial_calendar', calendars.id[i]);
      setUserSettings_('post_day_events', metadata.post_day_events);
      setUserSettings_('cash_flow_events', metadata.cash_flow_events);
      break;
    }
  }
}
