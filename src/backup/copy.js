function validateSpreadsheet (fileId) {
  if (isInstalled_()) return 1;

  let spreadsheet, file, metadata;

  try {
    file = DriveApp.getFileById(fileId);

    const owner = file.getOwner().getEmail();
    const user = Session.getEffectiveUser().getEmail();

    if (owner !== user) return 2;
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }

  if (file.getMimeType() !== MimeType.GOOGLE_SHEETS) return 3;

  try {
    spreadsheet = SpreadsheetApp.openById(fileId);
    const sheet = spreadsheet.getSheetByName('_About BnS');
    if (!sheet) return 3;

    const inner_key = PropertiesService.getScriptProperties().getProperty('inner_lock');
    if (!inner_key) {
      ConsoleLog.error("validateSpreadsheet(): Key 'inner_lock' was not found!");
      return 1;
    }

    const list = sheet.getDeveloperMetadata();
    let status = 0;

    for (let i = 0; i < list.length; i++) {
      if (list[i].getKey() !== 'bs_sig') continue;

      metadata = list[i].getValue();
      if (!metadata) continue;

      metadata = JSON.parse(metadata);

      let hmac = computeHmacSignature('SHA_256', metadata.encoded, inner_key, 'UTF_8');
      if (hmac === metadata.hmac) {
        status = 1;
        break;
      }
    }

    if (!status) return 3;
  } catch (err) {
    ConsoleLog.error(err);
    return 3;
  }

  const webSafeCode = metadata.encoded;
  const string = base64DecodeWebSafe(webSafeCode, 'UTF_8');
  const data = JSON.parse(string);

  // if (data.spreadsheet_id !== fileId) return 2;
  if (data.admin_id !== getUserId_()) return 2;

  return {
    file_name: spreadsheet.getName(),
    file_url: spreadsheet.getUrl(),
    last_updated: file.getLastUpdated().toString()
  };
}

function readSpreadsheetInfo (fileId) {
  const spreadsheet = SpreadsheetApp.openById(fileId);
  let sheet, values, cols;
  let list;

  const w_ = TABLE_DIMENSION.width;

  const info = {
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

  info.financial_year = values[0][0];
  info.initial_month = MN_FULL[values[2][0]];
  info.tags = values[5][0];

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
    if (values[0][cols + w_ * i] != '') {
      let matches = values[0][cols + w_ * i].match(/\w+/g);
      if (matches) list.push(matches);
    }
  }
  info.cards = list;

  PropertiesService2.setProperty('document', 'settings_pc', 'json', info);

  info.accounts = info.accounts.join(', ');
  for (let i = 0; i < info.cards.length; i++) {
    info.cards[i] = info.cards[i][0];
  }
  info.cards = info.cards.join(', ');

  if (info.tags > 0) info.tags = 'Up to ' + info.tags + ' tag(s) found.';
  else info.tags = '-';

  return info;
}
