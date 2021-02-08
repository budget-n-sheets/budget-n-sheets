function setupProperties_ (yyyy_mm) {
  let properties;

  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  const adminId = getUserId_();
  const hour = 2 + randomInteger(4);

  properties = {
    initial_month: SETUP_SETTINGS.init_month,
    financial_calendar: '',
    post_day_events: false,
    cash_flow_events: false,
    override_zero: false,
    optimize_load: true
  };
  PropertiesService2.setProperty('document', 'user_settings', 'json', properties);
  CacheService2.put('document', 'user_settings', 'json', properties);

  properties = {
    admin_id: adminId,
    automatic_backup: false
  };
  PropertiesService2.setProperty('document', 'admin_settings', 'json', properties);
  CacheService2.put('document', 'admin_settings', 'json', properties);

  properties = {
    date_created: yyyy_mm.time,
    number_accounts: SETUP_SETTINGS.number_accounts,
    financial_year: SETUP_SETTINGS.financial_year
  };
  PropertiesService2.setProperty('document', 'const_properties', 'json', properties);
  CacheService2.put('document', 'const_properties', 'json', properties);

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
    optimize_load: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  };
  PropertiesService2.setProperty('document', 'spreadsheet_settings', 'json', properties);
  CacheService2.put('document', 'spreadsheet_settings', 'json', properties);

  properties = {
    owner: adminId,
    onOpen: { id: '', time_created: 0 },
    onEdit: { id: '', time_created: 0 },
    timeBased: { id: '', time_created: 0 }
  };
  PropertiesService2.setProperty('document', 'spreadsheet_triggers', 'json', properties);
}
