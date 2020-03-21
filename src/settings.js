function retrieveUserSettings() {
	var user_settings = getPropertiesService_('document', 'json', 'user_settings');

	user_settings.docName = SpreadsheetApp.getActiveSpreadsheet().getName();
	user_settings.financial_year = getUserConstSettings_('financial_year');

	if (user_settings.financial_calendar != "") {
		user_settings.financial_calendar = computeDigest(
			"MD5",
			user_settings.financial_calendar,
			"UTF_8");
	}

	return user_settings;
}


function saveUserSettings(settings) {
	var spreadsheet, sheet;
	var db_calendars, calendar, c;
	var user_settings, yyyy, mm, init;

	spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	sheet = spreadsheet.getSheetByName("_Settings");
	if (!sheet) return 1;

	mm = getUserSettings_("initial_month");
	init = Number(settings.initial_month);

	calendar = "";

	if (settings.financial_calendar !== "") {
		db_calendars = getCacheService_('document', 'DB_CALENDARS', 'json');
		if (!db_calendars) db_calendars = getAllOwnedCalendars();

		c = db_calendars.md5.indexOf(settings.financial_calendar);
		if (c != -1) calendar = db_calendars.id[c];
	}

	user_settings = {
		spreadsheet_locale: spreadsheet.getSpreadsheetLocale(),
		initial_month: init,

		financial_calendar: calendar,
		OnlyEventsOwned: false,
		PostDayEvents: settings.post_day_events,
		post_day_events: settings.post_day_events,
		OverrideZero: settings.override_zero,
		override_zero: settings.override_zero,
		CashFlowEvents: settings.cash_flow_events,
		cash_flow_events: settings.cash_flow_events
	};

	try {
		setPropertiesService_("document", "json", "user_settings", user_settings);
	} catch (err) {
		consoleLog_('error', 'saveUserSettings()', err);
		return 1;
	}

	try {
		if (!update_DecimalSepartor_()) return 1;
	} catch (err) {
		consoleLog_('error', 'update_DecimalSepartor_()', err);
		return 1;
	}

	yyyy = getUserConstSettings_('financial_year');

	sheet.getRange("B2").setFormula("=" + yyyy.formatLocaleSignal());
	sheet.getRange("B4").setFormula("=" + (init + 1).formatLocaleSignal());
	SpreadsheetApp.flush();

	if (mm !== init) foo_ColorTabs_();

	return -1;
}


function getUserSettings_(select) {
	var user_settings, financial_year;
	var dateToday, dateTodayYear, dateTodayMonth;
	var tmp;

	user_settings = getPropertiesService_('document', 'json', 'user_settings');
	financial_year = getUserConstSettings_('financial_year');

	switch (select) {
		case 'docName': // Spreadsheet file name
			return spreadsheet.getName();

		case 'spreadsheet_locale':
		case 'financial_calendar':
		case 'OnlyEventsOwned':
		case 'PostDayEvents':
		case 'post_day_events':
		case 'OverrideZero':
		case 'override_zero':
		case 'CashFlowEvents':
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
		case 'OnlyEventsOwned':
		case 'PostDayEvents':
		case 'post_day_events':
		case 'CashFlowEvents':
		case 'cash_flow_events':
		case 'OverrideZero':
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


function getUserConstSettings_(select) {
	var user_const_settings = getPropertiesService_('document', 'obj', 'user_const_settings');

	switch (select) {
		case 'financial_year':
		case 'number_accounts':
		case 'date_created':
			return user_const_settings[select];

		default:
			console.error("getUserConstSettings_(): Switch case is default.", select);
			break;
	}
}
