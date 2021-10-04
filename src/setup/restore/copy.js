function restrieveSpreadsheetInfo (uuid) {
  if (!CacheService3.user().get(uuid)) {
    showSessionExpired();
    return;
  }

  const address = Utilities2.computeDigest('SHA_1', 'settings_summary:' + uuid, 'UTF_8');
  const settings_summary = CacheService3.document().get(address);
  CacheService3.document().remove(address);
  return settings_summary;
}

function requestValidateSpreadsheet (uuid, file_id) {
  if (!CacheService3.user().get(uuid)) {
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

  CacheService3.user().put(uuid, true);
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

  const spreadsheet = SpreadsheetApp.openById(file_id);
  const bs = new BsAuth(spreadsheet);

  if (!bs.verify()) {
    showDialogSetupCopy(uuid, 'Sorry, it was not possible to verify the spreadsheet.');
    return;
  }

  if (bs.getValueOf('admin_id') !== User2.getId()) {
    showDialogSetupCopy(uuid, 'No spreadsheet with the given ID could be found, or you do not have permission to access it.');
    return;
  }

  return 0;
}

function processSpreadsheet_ (uuid, file_id) {
  if (!FeatureFlag.getStatusOf('setup/copy')) return 1;

  const spreadsheet = SpreadsheetApp.openById(file_id);
  const metadata = new Metadata(spreadsheet);
  let property;

  const info = {
    file_id: file_id,
    file_url: spreadsheet.getUrl(),
    spreadsheet_title: spreadsheet.getName(),

    financial_year: Consts.date.getFullYear(),
    initial_month: Consts.date.getMonth(),

    accounts: [],
    cards: [],
    tags: 0
  };

  property = metadata.getValueOf('const_properties');
  if (property) info.financial_year = property.financial_year;

  property = metadata.getValueOf('user_settings');
  if (property) info.financial_year = property.initial_month;

  property = metadata.getValueOf('db_accounts');
  if (property) {
    for (const k in property) {
      info.accounts.push(property[k].name);
    }
  }

  property = metadata.getValueOf('db_cards');
  if (property) {
    for (const k in property) {
      info.cards.push(property[k].name);
    }
  }

  const sheet = spreadsheet.getSheetByName('Tags');
  if (sheet) info.tags = sheet.getLastRow() - 1;

  PropertiesService3.document().setProperty('settings_candidate', info);

  info.initial_month = Consts.month_name.long[info.initial_month];

  info.accounts = info.accounts.join(', ');
  info.cards = info.cards.join(', ');

  if (info.tags > 0) info.tags = 'Up to ' + info.tags + ' tag(s) found.';
  else info.tags = '-';

  const address = Utilities2.computeDigest('SHA_1', 'settings_summary:' + uuid, 'UTF_8');
  CacheService3.document().put(address, info);
  return 0;
}
