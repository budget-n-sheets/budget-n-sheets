function getSpreadsheetSettings_ (select) {
  const spreadsheet_settings = CachedAccess.get('spreadsheet_settings');

  switch (select) {
    case 'decimal_separator':
    case 'decimal_places':
    case 'spreadsheet_locale':
    case 'view_mode':
    case 'optimize_load':
      return spreadsheet_settings[select];

    default:
      console.error('getSpreadsheetSettings_(): Switch case is default.', select);
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
      console.error('setSpreadsheetSettings_() : Switch case is default.', select);
      return 1;
  }

  CachedAccess.update('spreadsheet_settings', spreadsheet_settings);
}
