function validateSpreadsheet (fileId) {
  if (isInstalled_()) return 1;

  let spreadsheet, file, parts;

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

    const displayValue = sheet.getRange(8, 2).getDisplayValue();

    parts = displayValue.split(':');
    const sha = computeHmacSignature('SHA_256', parts[0], inner_key, 'UTF_8');

    if (sha !== parts[1]) return 3;
  } catch (err) {
    ConsoleLog.error(err);
    return 3;
  }

  const webSafeCode = parts[0];
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

    accounts: '',
    cards: '',
    tags: '-'
  };

  sheet = spreadsheet.getSheetByName('_Settings');
  if (!sheet) return 1;

  values = sheet.getRange(2, 2, 7, 1).getValues();

  info.financial_year = values[0][0];
  info.initial_month = MN_FULL[values[2][0]];
  if (values[5][0] > 0) info.tags = 'Up to ' + values[5][0] + ' tag(s) found.';

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
  info.accounts = list.join(', ');

  list = [];
  cols = 2 * w_ + num_accs * w_;
  for (let i = 0; i < 10; i++) {
    if (values[0][cols + w_ * i] != '') {
      let match = values[0][cols + w_ * i].match(/\w+/);
      if (match) list.push(match);
    }
  }
  info.cards = list.join(', ');

  return info;
}
