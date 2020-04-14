function retrieveUserSettings() {
	var user_settings = getPropertiesService_('document', 'json', 'user_settings');

	if (user_settings.financial_calendar != "") {
		user_settings.financial_calendar = computeDigest(
				"MD5", user_settings.financial_calendar, "UTF_8"
			);
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
		spreadsheet_locale: spreadsheet.getSpreadsheetLocale(),
		initial_month: init,
		override_zero: settings.override_zero,

		financial_calendar: calendar.financial_calendar,
		post_day_events: calendar.post_day_events,
		cash_flow_events: calendar.cash_flow_events
	};
	setPropertiesService_("document", "json", "user_settings", user_settings);

	updateDecimalSepartor_();

	if (mm !== init) {
		sheet.getRange("B4").setFormula("=" + (init + 1).formatLocaleSignal());
		SpreadsheetApp.flush();

		foo_ColorTabs_();
	}
}


function getUserSettings_(select) {
	var user_settings, financial_year;
	var dateToday, dateTodayYear, dateTodayMonth;
	var tmp;

	user_settings = getPropertiesService_('document', 'json', 'user_settings');
	financial_year = getConstProperties_('financial_year');

	switch (select) {
		case 'spreadsheet_locale':
		case 'financial_calendar':
		case 'post_day_events':
		case 'override_zero':
		case 'cash_flow_events':
		case 'initial_month': // Number in 0-11 range
			return user_settings[select];

		case 'ActualMonth': // Number in 0-12 range
			dateToday = getSpreadsheetDate();

			if (dateToday.getFullYear() == financial_year) return dateToday.getMonth() + 1;
			else if (dateToday.getFullYear() < financial_year) return 0;
			else return 12;

		case 'ActiveMonths': // Number in 0-12 range
			dateToday = getSpreadsheetDate();
			dateTodayMonth;

			if (dateToday.getFullYear() == financial_year) dateTodayMonth = dateToday.getMonth() + 1;
			else if (dateToday.getFullYear() < financial_year) dateTodayMonth = 0;
			else dateTodayMonth = 12;

			user_settings.initial_month++;
			if (user_settings.initial_month > dateTodayMonth) return 0;
			else return (dateTodayMonth - user_settings.initial_month + 1);

		case 'MFactor': // Number in 0-12 range
			dateTodayYear = getSpreadsheetDate().getFullYear();
			tmp = getUserSettings_('ActiveMonths');

			if (dateTodayYear == financial_year) {
				tmp--;
				if (tmp > 0) return tmp;
				else return 0;
			} else if (dateTodayYear < financial_year) {
				return 0;
			} else {
				return tmp;
			}

		default:
			console.error("getUserSettings_(): Switch case is default.", select);
			break;
	}
}


function setUserSettings_(select, value) {
	var user_settings = getPropertiesService_('document', 'json', 'user_settings');

	switch (select) {
		case 'initial_month':
		case 'spreadsheet_locale':
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
	return true;
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
