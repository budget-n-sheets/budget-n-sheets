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

function getMonthFactored_ (select) {
  const date = getLocaleDate();
  let yyyy, mm;

  const financial_year = getConstProperties_('financial_year');

  if (select === 'actual_month') {
    yyyy = date.getFullYear();

    if (yyyy === financial_year) return date.getMonth() + 1;
    else if (yyyy < financial_year) return 0;
    else return 12;
  } else if (select === 'active_months') {
    if (date.getFullYear() === financial_year) mm = date.getMonth() + 1;
    else if (date.getFullYear() < financial_year) mm = 0;
    else mm = 12;

    user_settings.initial_month++;

    if (user_settings.initial_month > mm) return 0;
    else return (mm - user_settings.initial_month + 1);
  } else if (select === 'm_factor') {
    yyyy = date.getFullYear();
    mm = getMonthFactored_('active_months');

    if (yyyy === financial_year) {
      mm--;
      if (mm > 0) return mm;
      else return 0;
    } else if (yyyy < financial_year) {
      return 0;
    } else {
      return mm;
    }
  } else {
    ConsoleLog.error('getMonthFactored_(): Switch case is default.', select);
  }
}
