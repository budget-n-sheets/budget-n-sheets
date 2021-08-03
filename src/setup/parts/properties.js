function setupProperties_ () {
  let properties;

  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  const adminId = User2.getId();

  properties = {
    initial_month: SETUP_SETTINGS.init_month,
    financial_calendar: '',
    post_day_events: false,
    cash_flow_events: false,
    override_zero: false,
    optimize_load: true
  };
  CachedAccess.update('user_settings', properties);

  properties = {
    admin_id: adminId,
    automatic_backup: false
  };
  CachedAccess.update('admin_settings', properties);

  properties = {
    date_created: SETUP_SETTINGS.date.time,
    number_accounts: SETUP_SETTINGS.number_accounts,
    financial_year: SETUP_SETTINGS.financial_year
  };
  CachedAccess.update('const_properties', properties);

  const metadata = {
    number_accounts: SETUP_SETTINGS.number_accounts,
    financial_year: SETUP_SETTINGS.financial_year
  };

  spreadsheet.addDeveloperMetadata(
    'const_properties',
    JSON.stringify(metadata),
    SpreadsheetApp.DeveloperMetadataVisibility.PROJECT
  );

  properties = {
    view_mode: 'complete',
    decimal_places: SETUP_SETTINGS.decimal_places,
    decimal_separator: SETUP_SETTINGS.decimal_separator,
    spreadsheet_locale: spreadsheet.getSpreadsheetLocale(),
    optimize_load: [false, false, false, false, false, false, false, false, false, false, false, false]
  };
  CachedAccess.update('spreadsheet_settings', properties);

  properties = {
    owner: adminId,
    onOpen: { id: '', time_created: 0 },
    onEdit: { id: '', time_created: 0 },
    timeBased: { id: '', time_created: 0 }
  };
  PropertiesService3.document().setProperty('spreadsheet_triggers', properties);
}
