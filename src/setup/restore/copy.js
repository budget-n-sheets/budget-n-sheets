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
    showDialogSetupCopy(uuid, 'Sorry, it was not possible to verify the spreadsheet.');
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

  const settings_candidate = {
    uuid: uuid,
    protocol: 'copy',
    source: {
      file_id: file_id,
      file_url: spreadsheet.getUrl(),
      type: 'GOOGLE_SHEETS'
    },
    settings: {
      spreadsheet_name: spreadsheet.getName(),
      financial_year: Consts.date.getFullYear(),
      initial_month: Consts.date.getMonth(),
      decimal_places: 2,
      financial_calendar: '',
      accounts: []
    },
    misc: {
      cards: [],
      tags: 0
    }
  };

  property = metadata.getValueOf('const_properties');
  if (!property) return 1;
  settings_candidate.settings.financial_year = property.financial_year;

  property = metadata.getValueOf('user_settings');
  if (!property) return 1;
  settings_candidate.settings.initial_month = property.initial_month;
  settings_candidate.settings.financial_calendar = property.financial_calendar_sha256;


  property = metadata.getValueOf('db_accounts');
  if (!property) return 1;
  for (const k in property) {
    settings_candidate.settings.accounts.push({
      index: k,
      id: 'acc' + k,
      name: property[k].name,

      newIndex: -1,
      selected: false
    });
  }


  property = metadata.getValueOf('db_cards');
  if (!property) return 1;
  for (const k in property) {
    settings_candidate.misc.cards.push(property[k].name);
  }


  const sheet = spreadsheet.getSheetByName('Tags');
  if (sheet) settings_candidate.misc.tags = sheet.getLastRow() - 1;

  PropertiesService3.document().setProperty('settings_candidate', settings_candidate);
  cacheSettingsSummary_(settings_candidate);
  return 0;
}
