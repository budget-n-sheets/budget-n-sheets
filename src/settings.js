function retrieveUserSettings() {
	var user_settings = CacheService2.get("document", "user_settings", "json");
	if (!user_settings) {
		user_settings = PropertiesService2.getProperty("document", "user_settings", "json");
		CacheService2.put("document", "user_settings", "json", user_settings);
	}

	const user_id = getUserId_();

	if (user_id === classAdminSettings_("get", "admin_id")) {
		if (user_settings.financial_calendar) {
			user_settings.financial_calendar = computeDigest("MD5", user_settings.financial_calendar, "UTF_8");
			user_settings.financial_calendar = user_settings.financial_calendar.substring(0, 12);
		}

	} else if ( classAdminSettings_("get", "isChangeableByEditors") ) {
		if (user_settings.financial_calendar) {
			user_settings.financial_calendar = "";
			user_settings.hasFinancialCalendar = true;
		} else {
			user_settings.hasFinancialCalendar = false;
		}

	} else {
		return;
	}

	return user_settings;
}


function saveUserSettings(settings) {
	const user_id = getUserId_();

	var db_calendars, sheet, c;
	var calendar = {
		financial_calendar: "",
		post_day_events: false,
		cash_flow_events: false
	};

	if (user_id === classAdminSettings_("get", "admin_id")) {
    if (settings.financial_calendar) {
      db_calendars = getAllOwnedCalendars();

      c = db_calendars.md5.indexOf(settings.financial_calendar);
      if (c !== -1) {
        calendar.financial_calendar = db_calendars.id[c];
        calendar.post_day_events = settings.post_day_events;
        calendar.cash_flow_events = settings.cash_flow_events;
      }
    }
	} else if ( classAdminSettings_("get", "isChangeableByEditors") ) {
		const financial_calendar = getUserSettings_("financial_calendar");
		if (financial_calendar) {
			calendar.financial_calendar = financial_calendar;
			calendar.post_day_events = settings.post_day_events;
			calendar.cash_flow_events = settings.cash_flow_events;
		}

	} else {
		return 1;
	}

	const new_init_month = Number(settings.initial_month);
	const init_month = getUserSettings_("initial_month");

	const user_settings = {
		initial_month: new_init_month,
    view_mode: settings.view_mode,
		override_zero: settings.override_zero,

		financial_calendar: calendar.financial_calendar,
		post_day_events: calendar.post_day_events,
		cash_flow_events: calendar.cash_flow_events
	};
	PropertiesService2.setProperty("document", "user_settings", "json", user_settings);
	CacheService2.put("document", "user_settings", "json", user_settings);

  try {
    updateDecimalSeparator_();

    if (user_settings.view_mode === 'complete') viewModeComplete()
    else if (user_settings.view_mode === 'simple') viewModeSimple()

    if (init_month == new_init_month) return;

    sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("_Settings");
    if (sheet) {
      sheet.getRange("B4").setFormula("=" + numberFormatLocaleSignal.call(new_init_month + 1));
      SpreadsheetApp.flush();
    }

    updateTabsColors();
  } catch (err) {
    console.error('saveUserSettings(): ' + err)
  }
}


function getUserSettings_(select) {
	var user_settings;

	user_settings = PropertiesService2.getProperty("document", "user_settings", "json");

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


function setUserSettings_(select, value) {
	var user_settings = PropertiesService2.getProperty("document", "user_settings", "json");

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

	PropertiesService2.setProperty("document", "user_settings", "json", user_settings);
	CacheService2.put("document", "user_settings", "json", user_settings);
	return true;
}


function getSpreadsheetSettings_(select) {
	var spreadsheet_settings;

	spreadsheet_settings = CacheService2.get("document", "spreadsheet_settings", "json");
	if (!spreadsheet_settings) {
		spreadsheet_settings = PropertiesService2.getProperty("document", "spreadsheet_settings", "json");
		CacheService2.put("document", "spreadsheet_settings", "json", spreadsheet_settings);
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
	var spreadsheet_settings = PropertiesService2.getProperty("document", "spreadsheet_settings", "json");

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

	PropertiesService2.setProperty("document", "spreadsheet_settings", "json", spreadsheet_settings);
	CacheService2.put("document", "spreadsheet_settings", "json", spreadsheet_settings);
}


function getConstProperties_(select) {
	var const_properties;

	const_properties = CacheService2.get("document", "const_properties", "json");
	if (!const_properties) {
		const_properties = PropertiesService2.getProperty("document", "const_properties", "json");
		CacheService2.put("document", "const_properties", "json", const_properties);
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

function getMonthFactored_(select) {
	var date = DATE_NOW.getSpreadsheetDate();
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
