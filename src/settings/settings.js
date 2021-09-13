function retrieveUserSettings () {
  if (!User2.isAdmin()) return;

  const user_settings = CachedAccess.get('user_settings');

  if (user_settings.financial_calendar) {
    user_settings.financial_calendar = Utilities2.computeDigest(
      'SHA_1',
      user_settings.financial_calendar,
      'UTF_8')
      .substring(0, 12);
  }

  user_settings.decimal_places = SettingsSpreadsheet.getValueOf('decimal_places');
  user_settings.view_mode = SettingsSpreadsheet.getValueOf('view_mode');

  return user_settings;
}

function saveUserSettings (settings) {
  if (!User2.isAdmin()) return 1;

  const calendar = {
    financial_calendar: '',
    post_day_events: false,
    cash_flow_events: false
  };

  if (settings.financial_calendar) {
    const cal = Calendar.listAllCalendars()[settings.financial_calendar];
    if (cal) {
      calendar.financial_calendar = cal.id;
      calendar.post_day_events = settings.post_day_events;
      calendar.cash_flow_events = settings.cash_flow_events;
    }
  }

  const new_init_month = Number(settings.initial_month);
  const init_month = SettingsUser.getValueOf('initial_month');
  const decimal_places = SettingsSpreadsheet.getValueOf('decimal_places');

  const user_settings = {
    initial_month: new_init_month,
    override_zero: false,
    optimize_load: true,

    financial_calendar: calendar.financial_calendar,
    post_day_events: calendar.post_day_events,
    cash_flow_events: calendar.cash_flow_events
  };
  CachedAccess.update('user_settings', user_settings);
  RapidAccess.properties().clear();

  updateSettingsMetadata_(user_settings);

  settings.decimal_places = Number(settings.decimal_places);
  SettingsSpreadsheet.setValueOf('decimal_places', settings.decimal_places);

  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();

  try {
    if (SettingsSpreadsheet.getValueOf('spreadsheet_locale') !== spreadsheet.getSpreadsheetLocale()) {
      updateDecimalSeparator_();
    }
  } catch (err) {
    LogLog.error(err);
  }

  try {
    if (decimal_places !== settings.decimal_places) {
      updateDecimalPlaces_();
    }
  } catch (err) {
    LogLog.error(err);
  }

  try {
    if (SettingsSpreadsheet.getValueOf('view_mode') !== settings.view_mode) {
      setViewMode_(settings.view_mode !== 'simple');
    }
  } catch (err) {
    LogLog.error(err);
  }

  if (init_month === new_init_month) return;

  try {
    const sheet = spreadsheet.getSheetByName('_Settings');
    if (sheet) {
      sheet.getRange('B4').setFormula('=' + new FormatNumber().localeSignal(new_init_month + 1));
      SpreadsheetApp.flush();
    }

    updateTabsColors();
  } catch (err) {
    LogLog.error(err);
  }
}

function updateSettingsMetadata_ (user_settings) {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();

  const metadata = {
    initial_month: user_settings.initial_month,
    financial_calendar_sha256: '',
    post_day_events: user_settings.post_day_events,
    cash_flow_events: user_settings.cash_flow_events
  };

  if (user_settings.financial_calendar !== '') {
    metadata.financial_calendar_sha256 = Utilities2.computeDigest(
      'SHA_256',
      user_settings.financial_calendar,
      'UTF_8'
    );
  }

  new Metadata().update('user_settings', metadata);
}
