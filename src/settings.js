function retrieveUserSettings () {
  let user_settings = CacheService2.get('document', 'user_settings', 'json');
  if (!user_settings) {
    user_settings = PropertiesService2.getProperty('document', 'user_settings', 'json');
    CacheService2.put('document', 'user_settings', 'json', user_settings);
  }

  const user_id = getUserId_();

  if (user_id === getAdminSettings_('admin_id')) {
    if (user_settings.financial_calendar) {
      user_settings.financial_calendar = computeDigest('MD5', user_settings.financial_calendar, 'UTF_8');
      user_settings.financial_calendar = user_settings.financial_calendar.substring(0, 12);
    }
  } else if (getAdminSettings_('isChangeableByEditors')) {
    if (user_settings.financial_calendar) {
      user_settings.financial_calendar = '';
      user_settings.hasFinancialCalendar = true;
    } else {
      user_settings.hasFinancialCalendar = false;
    }
  } else {
    return;
  }

  user_settings.decimal_places = getSpreadsheetSettings_('decimal_places');

  return user_settings;
}

function saveUserSettings (settings) {
  console.info('sidebar/Settings/Settings/Save');
  const user_id = getUserId_();

  const calendar = {
    financial_calendar: '',
    post_day_events: false,
    cash_flow_events: false
  };

  if (user_id === getAdminSettings_('admin_id')) {
    if (settings.financial_calendar) {
      const db_calendars = getAllOwnedCalendars();
      const c = db_calendars.md5.indexOf(settings.financial_calendar);

      if (c !== -1) {
        calendar.financial_calendar = db_calendars.id[c];
        calendar.post_day_events = settings.post_day_events;
        calendar.cash_flow_events = settings.cash_flow_events;
      }
    }
  } else if (getAdminSettings_('isChangeableByEditors')) {
    const financial_calendar = getUserSettings_('financial_calendar');
    if (financial_calendar) {
      calendar.financial_calendar = financial_calendar;
      calendar.post_day_events = settings.post_day_events;
      calendar.cash_flow_events = settings.cash_flow_events;
    }
  } else {
    return 1;
  }

  const new_init_month = Number(settings.initial_month);
  const init_month = getUserSettings_('initial_month');
  const decimal_places = getSpreadsheetSettings_('decimal_places');

  const user_settings = {
    initial_month: new_init_month,
    override_zero: false,
    optimize_load: true,

    financial_calendar: calendar.financial_calendar,
    post_day_events: calendar.post_day_events,
    cash_flow_events: calendar.cash_flow_events
  };
  PropertiesService2.setProperty('document', 'user_settings', 'json', user_settings);
  CacheService2.put('document', 'user_settings', 'json', user_settings);

  updateSettingsMetadata_(user_settings);

  settings.decimal_places = Number(settings.decimal_places);
  setSpreadsheetSettings_('decimal_places', settings.decimal_places);

  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();

  try {
    if (getSpreadsheetSettings_('spreadsheet_locale') !== spreadsheet.getSpreadsheetLocale()) {
      updateDecimalSeparator_();
    }
  } catch (err) {
    ConsoleLog.error(err);
  }

  try {
    if (decimal_places !== settings.decimal_places) {
      updateDecimalPlaces_();
    }
  } catch (err) {
    ConsoleLog.error(err);
  }

  if (init_month === new_init_month) return;

  try {
    const sheet = spreadsheet.getSheetByName('_Settings');
    if (sheet) {
      sheet.getRange('B4').setFormula('=' + FormatNumber.localeSignal(settings.initial_month + 1));
      SpreadsheetApp.flush();
    }

    updateTabsColors();
  } catch (err) {
    ConsoleLog.error(err);
  }
}

function updateSettingsMetadata_ (user_settings) {
  const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('_Settings');

  const metadata = {
    initial_month: user_settings.initial_month,
    financial_calendar_sha256: '',
    post_day_events: user_settings.post_day_events,
    cash_flow_events: user_settings.cash_flow_events
  };

  if (user_settings.financial_calendar !== '') {
    metadata.financial_calendar_sha256 = computeDigest(
      'SHA_256',
      user_settings.financial_calendar,
      'UTF_8'
    );
  }

  const elements = sheet.createDeveloperMetadataFinder()
    .withVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
    .withKey('user_settings')
    .find();

  if (elements.length > 0) {
    elements[0].setValue(JSON.stringify(metadata));
  } else {
    sheet.addDeveloperMetadata(
      'user_settings',
      JSON.stringify(metadata),
      SpreadsheetApp.DeveloperMetadataVisibility.PROJECT
    );
  }
}

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
