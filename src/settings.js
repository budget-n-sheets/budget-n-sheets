function getUserSettings_ (select) {
  let user_settings = CacheService2.get('document', 'user_settings', 'json');
  if (!user_settings) {
    user_settings = PropertiesService2.getProperty('document', 'user_settings', 'json');
    CacheService2.put('document', 'user_settings', 'json', user_settings);
  }

  switch (select) {
    case 'financial_calendar':
    case 'post_day_events':
    case 'override_zero':
    case 'cash_flow_events':
    case 'initial_month':
    case 'optimize_load':
      return user_settings[select];

    default:
      ConsoleLog.error('getUserSettings_(): Switch case is default.', select);
      break;
  }
}

function setUserSettings_ (select, value) {
  const user_settings = PropertiesService2.getProperty('document', 'user_settings', 'json');

  switch (select) {
    case 'initial_month':
    case 'financial_calendar':
    case 'post_day_events':
    case 'cash_flow_events':
    case 'override_zero':
    case 'optimize_load':
      user_settings[select] = value;
      break;

    default:
      ConsoleLog.error('setUserSettings_() : Switch case is default.', select);
      return false;
  }

  PropertiesService2.setProperty('document', 'user_settings', 'json', user_settings);
  CacheService2.put('document', 'user_settings', 'json', user_settings);

  updateSettingsMetadata_(user_settings);

  return true;
}

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

function getConstProperties_ (select) {
  let const_properties;

  const_properties = CacheService2.get('document', 'const_properties', 'json');
  if (!const_properties) {
    const_properties = PropertiesService2.getProperty('document', 'const_properties', 'json');
    CacheService2.put('document', 'const_properties', 'json', const_properties);
  }

  switch (select) {
    case 'financial_year':
    case 'number_accounts':
    case 'date_created':
      return const_properties[select];

    default:
      ConsoleLog.error('getConstProperties_(): Switch case is default.', select);
      break;
  }
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
