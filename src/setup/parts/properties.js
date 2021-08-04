function setupProperties_ () {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  const adminId = User2.getId();

  const setup_settings = CachedAccess.get('setup_settings');
  let properties;

  properties = {
    initial_month: setup_settings.init_month,
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
    date_created: setup_settings.date.time,
    number_accounts: setup_settings.number_accounts,
    financial_year: setup_settings.financial_year
  };
  CachedAccess.update('const_properties', properties);

  const metadata = {
    number_accounts: setup_settings.number_accounts,
    financial_year: setup_settings.financial_year
  };

  spreadsheet.addDeveloperMetadata(
    'const_properties',
    JSON.stringify(metadata),
    SpreadsheetApp.DeveloperMetadataVisibility.PROJECT
  );

  properties = {
    view_mode: 'complete',
    decimal_places: setup_settings.decimal_places,
    decimal_separator: setup_settings.decimal_separator,
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
