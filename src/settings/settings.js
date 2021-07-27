function retrieveUserSettings () {
  if (!isUserAdmin_()) return;

  const user_settings = CachedAccess.get('user_settings');

  if (user_settings.financial_calendar) {
    user_settings.financial_calendar = computeDigest('MD5', user_settings.financial_calendar, 'UTF_8');
    user_settings.financial_calendar = user_settings.financial_calendar.substring(0, 12);
  }

  user_settings.decimal_places = getSpreadsheetSettings_('decimal_places');
  user_settings.view_mode = getSpreadsheetSettings_('view_mode');

  return user_settings;
}

function saveUserSettings (settings) {
  if (!isUserAdmin_()) return 1;

  const calendar = {
    financial_calendar: '',
    post_day_events: false,
    cash_flow_events: false
  };

  if (settings.financial_calendar) {
    const db_calendars = getAllOwnedCalendars();
    const c = db_calendars.md5.indexOf(settings.financial_calendar);

    if (c !== -1) {
      calendar.financial_calendar = db_calendars.id[c];
      calendar.post_day_events = settings.post_day_events;
      calendar.cash_flow_events = settings.cash_flow_events;
    }
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
  CachedAccess.update('user_settings', user_settings);

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

  try {
    setViewMode_(settings.view_mode);
  } catch (err) {
    ConsoleLog.error(err);
  }

  if (init_month === new_init_month) return;

  try {
    const sheet = spreadsheet.getSheetByName('_Settings');
    if (sheet) {
      sheet.getRange('B4').setFormula('=' + FormatNumber.localeSignal(new_init_month + 1));
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
