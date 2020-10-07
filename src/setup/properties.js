function setupProperties_(yyyy_mm) {
	var properties, operation

	const hour = 2 + randomInteger(4);

	properties = {
		initial_month: SETUP_SETTINGS["init_month"],
		financial_calendar: "",
		post_day_events: false,
		cash_flow_events: false,
		override_zero: false,
    optimize_load: true
	};
	PropertiesService2.setProperty("document", "user_settings", "json", properties);


	properties = {
		admin_id: getUserId_(),
		isChangeableByEditors: false,
    automatic_backup: false
	};
	PropertiesService2.setProperty("document", "admin_settings", "json", properties);


	properties = {
		date_created: yyyy_mm.time,
		number_accounts: SETUP_SETTINGS["number_accounts"],
		financial_year: SETUP_SETTINGS["financial_year"]
	};
	PropertiesService2.setProperty("document", "const_properties", "json", properties);


  if (SETUP_SETTINGS["financial_year"] === yyyy_mm.yyyy) operation = "active"
  else operation = "passive"

	properties = {
		operation_mode: operation,
    view_mode: 'complete',
		decimal_separator: SETUP_SETTINGS["decimal_separator"],
		decimal_separator: SETUP_SETTINGS['decimal_separator'],
		spreadsheet_locale: SPREADSHEET.getSpreadsheetLocale(),
		optimize_load: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
	};
	PropertiesService2.setProperty("document", "spreadsheet_settings", "json", properties);
}
