class UserSettings {
  constructor () {
    this._flush = {
      decimal_places: false,
      initial_month: false,
      view_mode: false
    };
  }

  static getSettings () {
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

  static updateMetadata_ () {
    const user_settings = CachedAccess.get('user_settings');

    const metadata = {
      initial_month: user_settings.initial_month,
      financial_calendar: user_settings.financial_calendar,
      post_day_events: user_settings.post_day_events,
      cash_flow_events: user_settings.cash_flow_events
    };

    new Metadata().update('user_settings', metadata);
  }

  flush () {
    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();

    try {
      if (SettingsSpreadsheet.getValueOf('spreadsheet_locale') !== spreadsheet.getSpreadsheetLocale()) {
        updateDecimalSeparator_();
      }
    } catch (err) {
      LogLog.error(err);
    }

    try {
      if (this._flush.decimal_places) updateDecimalPlaces_();
    } catch (err) {
      LogLog.error(err);
    }

    try {
      if (this._flush.view_mode) {
        const mode = SettingsSpreadsheet.getValueOf('view_mode') === 'simple';
        setViewMode_(mode);
      }
    } catch (err) {
      LogLog.error(err);
    }

    try {
      const sheet = spreadsheet.getSheetByName('_Settings');
      if (sheet) sheet.getRange('B4')
        .setFormula(
          new FormatNumber().localeSignal(SettingsUser.getValueOf('initial_month') + 1)
        );

      if (this._flush.initial_month) updateTabsColors();
    } catch (err) {
      LogLog.error(err);
    }
  }

  saveSidebarSettings (settings) {
    const calendar = {
      financial_calendar: '',
      post_day_events: false,
      cash_flow_events: false
    };

    if (settings.financial_calendar) {
      const cal = Calendar.listAllCalendars()[settings.financial_calendar];
      if (cal) {
        calendar.financial_calendar = cal.id;
        calendar.post_day_events = !!settings.post_day_events;
        calendar.cash_flow_events = !!settings.cash_flow_events;
      }
    }

    const decimal_places = Number(settings.decimal_places);
    const user_settings = {
      initial_month: Number(settings.initial_month),
      override_zero: false,
      optimize_load: true,

      financial_calendar: calendar.financial_calendar,
      post_day_events: calendar.post_day_events,
      cash_flow_events: calendar.cash_flow_events
    };

    this._flush.decimal_places = decimal_places !== SettingsSpreadsheet.getValueOf('decimal_places');
    this._flush.initial_month = user_settings.initial_month !== SettingsUser.getValueOf('initial_month');
    this._flush.view_mode = settings.view_mode !== SettingsSpreadsheet.getValueOf('view_mode');

    CachedAccess.update('user_settings', user_settings);
    RapidAccess.properties().clear();

    SettingsSpreadsheet.setValueOf('decimal_places', decimal_places);

    UserSettings.updateMetadata_();
    return this;
  }
}
