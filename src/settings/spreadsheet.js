function getSpreadsheetSettings_ (select) {
  let spreadsheet_settings;

  spreadsheet_settings = CacheService2.get('document', 'spreadsheet_settings', 'json');
  if (!spreadsheet_settings) {
    spreadsheet_settings = PropertiesService2.getProperty('document', 'spreadsheet_settings', 'json');
    CacheService2.put('document', 'spreadsheet_settings', 'json', spreadsheet_settings);
  }

  switch (select) {
    case 'decimal_separator':
    case 'decimal_places':
    case 'spreadsheet_locale':
    case 'view_mode':
    case 'optimize_load':
      return spreadsheet_settings[select];

    default:
      ConsoleLog.error('getSpreadsheetSettings_(): Switch case is default.', select);
      break;
  }
}

function setSpreadsheetSettings_ (select, value) {
  const spreadsheet_settings = PropertiesService2.getProperty('document', 'spreadsheet_settings', 'json');

  switch (select) {
    case 'decimal_separator':
    case 'decimal_places':
    case 'spreadsheet_locale':
    case 'view_mode':
    case 'optimize_load':
      spreadsheet_settings[select] = value;
      break;

    default:
      ConsoleLog.error('setSpreadsheetSettings_() : Switch case is default.', select);
      return 1;
  }

  PropertiesService2.setProperty('document', 'spreadsheet_settings', 'json', spreadsheet_settings);
  CacheService2.put('document', 'spreadsheet_settings', 'json', spreadsheet_settings);
}
