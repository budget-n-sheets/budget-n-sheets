function retrieveUserSettings() {
	var user_settings;

	user_settings = getCacheService_("document", "user_settings", "json");
	if (!user_settings) {
		user_settings = getPropertiesService_("document", "json", "user_settings");

		if (user_settings.financial_calendar != "") {
			user_settings.financial_calendar = computeDigest(
					"MD5", user_settings.financial_calendar, "UTF_8"
				);
		}

		putCacheService_("document", "user_settings", "json", user_settings);
	}

	return user_settings;
}


function saveUserSettings(settings) {
	var spreadsheet, sheet;
	var db_calendars, calendar, c;
	var user_settings, yyyy, mm, init;

	spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	sheet = spreadsheet.getSheetByName("_Settings");

	mm = getUserSettings_("initial_month");
	init = Number(settings.initial_month);

	calendar = {
		financial_calendar: "",
		post_day_events: false,
		cash_flow_events: false
	};

	if (settings.financial_calendar != "") {
		db_calendars = getCacheService_("document", "DB_CALENDARS", "json");
		if (!db_calendars) db_calendars = getAllOwnedCalendars();

		c = db_calendars.md5.indexOf(settings.financial_calendar);
		if (c != -1) {
			calendar.financial_calendar = db_calendars.id[c];
			calendar.post_day_events = settings.post_day_events;
			calendar.cash_flow_events = settings.cash_flow_events;
		}
	}

	user_settings = {
		initial_month: init,
		override_zero: settings.override_zero,

		financial_calendar: calendar.financial_calendar,
		post_day_events: calendar.post_day_events,
		cash_flow_events: calendar.cash_flow_events
	};
	setPropertiesService_("document", "json", "user_settings", user_settings);

	if (user_settings.financial_calendar != "") {
		user_settings.financial_calendar = computeDigest(
				"MD5", user_settings.financial_calendar, "UTF_8"
			);
	}
	putCacheService_("document", "user_settings", "json", user_settings);

	updateDecimalSepartor_();

	if (mm !== init) {
		sheet.getRange("B4").setFormula("=" + (init + 1).formatLocaleSignal());
		SpreadsheetApp.flush();

		foo_ColorTabs_();
	}
}


function getUserSettings_(select) {
	var user_settings;

	user_settings = getPropertiesService_('document', 'json', 'user_settings');

	switch (select) {
		case 'financial_calendar':
		case 'post_day_events':
		case 'override_zero':
		case 'cash_flow_events':
		case 'initial_month': // Number in 0-11 range
			return user_settings[select];

		default:
			console.error("getUserSettings_(): Switch case is default.", select);
			break;
	}
}


function getMonthFactored_(select) {
	var date = getSpreadsheetDate();
	var yyyy, mm;

	const financial_year = getConstProperties_("financial_year");

	if (select == "actual_month") {
		yyyy = date.getFullYear();

		if (yyyy == financial_year) return date.getMonth() + 1;
		else if (yyyy < financial_year) return 0;
		else return 12;

	} else if (select == "active_months") {
		if (date.getFullYear() == financial_year) mm = date.getMonth() + 1;
		else if (date.getFullYear() < financial_year) mm = 0;
		else mm = 12;

		user_settings.initial_month++;

		if (user_settings.initial_month > mm) return 0;
		else return (mm - user_settings.initial_month + 1);

	} else if (select == "m_factor") {
		yyyy = date.getFullYear();
		mm = getMonthFactored_("active_months");

		if (yyyy == financial_year) {
			mm--;
			if (mm > 0) return mm;
			else return 0;
		} else if (yyyy < financial_year) {
			return 0;
		} else {
			return mm;
		}

	} else {
		console.error("getMonthFactored_(): Switch case is default.", select);
	}
}


function setUserSettings_(select, value) {
	var user_settings = getPropertiesService_('document', 'json', 'user_settings');

	switch (select) {
		case 'initial_month':
		case 'financial_calendar':
		case 'post_day_events':
		case 'cash_flow_events':
		case 'override_zero':
			user_settings[select] = value;
			break;

		default:
			console.error("setUserSettings_() : Switch case is default.", select);
			return false;
	}

	setPropertiesService_('document', 'json', 'user_settings', user_settings);
	putCacheService_("document", "user_settings", "json", user_settings);
	return true;
}


function getSpreadsheetSettings_(select) {
	var spreadsheet_settings;

	spreadsheet_settings = getCacheService_("document", "spreadsheet_settings", "json");
	if (!spreadsheet_settings) {
		spreadsheet_settings = getPropertiesService_("document", "json", "spreadsheet_settings");
		putCacheService_("document", "spreadsheet_settings", "json", spreadsheet_settings);
	}

	switch (select) {
	case "operation_mode":
	case "decimal_separator":
	case "spreadsheet_locale":
		return spreadsheet_settings[select];

	default:
		console.error("getSpreadsheetSettings_(): Switch case is default.", select);
		break;
	}
}


function setSpreadsheetSettings_(select, value) {
	var spreadsheet_settings = getPropertiesService_("document", "json", "spreadsheet_settings");

	switch (select) {
	case "operation_mode":
	case "decimal_separator":
	case "spreadsheet_locale":
		spreadsheet_settings[select] = value;
		break;

	default:
		console.error("setSpreadsheetSettings_() : Switch case is default.", select);
		return 1;
	}

	setPropertiesService_("document", "json", "spreadsheet_settings", spreadsheet_settings);
	putCacheService_("document", "spreadsheet_settings", "json", spreadsheet_settings);
}


function getConstProperties_(select) {
	var const_properties;

	const_properties = getCacheService_("document", "const_properties", "json");
	if (!const_properties) {
		const_properties = getPropertiesService_("document", "json", "const_properties");
		putCacheService_("document", "const_properties", "json", const_properties);
	}

	switch (select) {
		case 'financial_year':
		case 'number_accounts':
		case 'date_created':
			return const_properties[select];

		default:
			console.error("getConstProperties_(): Switch case is default.", select);
			break;
	}
}
