function setupProperties_(yyyy_mm) {
	console.time("add-on/setup/properties");
	var properties, day;
	var trigger, operation;

	const hour = 2 + randomInteger(4);

	properties = {
		initial_month: SETUP_SETTINGS["init_month"],
    view_mode: 'complete',
		financial_calendar: "",
		post_day_events: false,
		cash_flow_events: false,
		override_zero: false
	};
	PropertiesService2.setProperty("document", "user_settings", "json", properties);


	properties = {
		admin_id: getUserId_(),
		isChangeableByEditors: false
	};
	PropertiesService2.setProperty("document", "admin_settings", "json", properties);


	properties = {
		date_created: yyyy_mm.time,
		number_accounts: SETUP_SETTINGS["number_accounts"],
		financial_year: SETUP_SETTINGS["financial_year"]
	};
	PropertiesService2.setProperty("document", "const_properties", "json", properties);


	trigger = createNewTrigger_('onEditInstallable_', 'onEdit')
  saveTriggerId_(trigger, 'document', 'onEditTriggerId')

	trigger = createNewTrigger_('onOpenInstallable_', 'onOpen')
  saveTriggerId_(trigger, 'document', 'onOpenTriggerId')

	if (SETUP_SETTINGS["financial_year"] < yyyy_mm.yyyy) {
		day = 1 + randomInteger(28);
		trigger = createNewTrigger_('weeklyTriggerPos_', 'onMonthDay', { days: day, hour: hour, minute: -1 })
    saveTriggerId_(trigger, 'document', 'clockTriggerId')
		operation = "passive";

	} else if (SETUP_SETTINGS["financial_year"] == yyyy_mm.yyyy) {
		trigger = createNewTrigger_('dailyTrigger_', 'everyDays', { days: 1, hour: hour, minute: -1 })
    saveTriggerId_(trigger, 'document', 'clockTriggerId')
		operation = "active";

	} else if (SETUP_SETTINGS["financial_year"] > yyyy_mm.yyyy) {
		day = new Date(SETUP_SETTINGS["financial_year"], 0, 2);
		day = day.getDay();
		trigger = createNewTrigger_('weeklyTriggerPre_', 'onWeekDay', { weeks: 1, week: day, hour: hour, minute: -1 })
    saveTriggerId_(trigger, 'document', 'clockTriggerId')
		operation = "passive";
	}

	properties = {
		operation_mode: operation,
		decimal_separator: SETUP_SETTINGS["decimal_separator"],
		spreadsheet_locale: SPREADSHEET.getSpreadsheetLocale()
	};
	PropertiesService2.setProperty("document", "spreadsheet_settings", "json", properties);

	console.timeEnd("add-on/setup/properties");
}
