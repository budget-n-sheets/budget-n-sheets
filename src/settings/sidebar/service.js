function getUserSettings () {
  if (!User2.isAdmin()) return;
  return UserSettings.getSettings();
}

function saveUserSettings (settings) {
  if (!User2.isAdmin()) return 1;
  UserSettings.setSettings(settings);
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
