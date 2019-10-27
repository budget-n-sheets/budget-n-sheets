function optAddonSettings_Retrieve() {
	var user_settings = getPropertiesService_('document', 'json', 'user_settings');

	user_settings.docName = SpreadsheetApp.getActiveSpreadsheet().getName();
	user_settings.listCalendars = optCalendar_GetListOwned();

	return user_settings;
}


function optAddonSettings_Save(settings) {
	var spreadsheet, sheet;
	var user_settings, yyyy, mm, init;

	spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	sheet = spreadsheet.getSheetByName("_Settings");
	if(!sheet) return 1;

	yyyy = optAddonSettings_Get_("FinancialYear");
	init = Number(settings.InitialMonth);

	user_settings = {
		SpreadsheetLocale: spreadsheet.getSpreadsheetLocale(),
		FinancialYear: yyyy,
		InitialMonth: init,

		FinancialCalendar: settings.FinancialCalendar,
		OnlyEventsOwned: false,
		PostDayEvents: settings.PostDayEvents,
		OverrideZero: settings.OverrideZero,
		CashFlowEvents: settings.CashFlowEvents
	};

	try {
		setPropertiesService_("document", "json", "user_settings", user_settings);
	} catch(err) {
		console.error("optAddonSettings_Save_()", err);
		return 1;
	}

	try {
		if(!update_DecimalSepartor_()) return 1;
	} catch(err) {
		console.error("update_DecimalSepartor_()", err);
		return 1;
	}

	sheet.getRange("B2").setFormula("=" + yyyy.formatLocaleSignal());
	sheet.getRange("B4").setFormula("=" + (init + 1).formatLocaleSignal());
	SpreadsheetApp.flush();

	mm = optAddonSettings_Get_("InitialMonth");
	if(mm !== init) foo_ColorTabs_();

	return -1;
}


function optAddonSettings_Get_(select) {
	var user_settings = getPropertiesService_('document', 'json', 'user_settings');
	var dateToday, dateTodayYear, dateTodayMonth;
	var tmp;

	switch(select) {
		case 'docName': // Spreadsheet file name
			return spreadsheet.getName();
		case 'FinancialYear': // Number in YYYY format
		case 'SpreadsheetLocale':
		case 'FinancialCalendar':
		case 'OnlyEventsOwned':
		case 'PostDayEvents':
		case 'OverrideZero':
		case 'CashFlowEvents':
		case 'InitialMonth': // Number in 0-11 range
			return user_settings[select];
		case 'ActualMonth': // Number in 0-12 range
			dateToday = getSpreadsheetDate();

			if(dateToday.getFullYear() == user_settings.FinancialYear) return dateToday.getMonth() + 1;
			else if(dateToday.getFullYear() < user_settings.FinancialYear) return 0;
			else return 12;
		case 'ActiveMonths': // Number in 0-12 range
			dateToday = getSpreadsheetDate();
			dateTodayMonth;

			if(dateToday.getFullYear() == user_settings.FinancialYear) dateTodayMonth = dateToday.getMonth() + 1;
			else if(dateToday.getFullYear() < user_settings.FinancialYear) dateTodayMonth = 0;
			else dateTodayMonth = 12;

			user_settings.InitialMonth++;
			if(user_settings.InitialMonth > dateTodayMonth) return 0;
			else return (dateTodayMonth - user_settings.InitialMonth + 1);
		case 'MFactor': // Number in 0-12 range
			dateTodayYear = getSpreadsheetDate().getFullYear();
			tmp = optAddonSettings_Get_('ActiveMonths');

			if(dateTodayYear == user_settings.FinancialYear) {
				tmp--;
				if(tmp > 0) return tmp;
				else return 0;
			} else if(dateTodayYear < user_settings.FinancialYear) {
				return 0;
			} else {
				return tmp;
			}

		default:
			console.error("optAddonSettings_Get_(): Switch case is default.", select);
			break;
	}
}


function optAddonSettings_Set_(select, value) {
	var user_settings = getPropertiesService_('document', 'json', 'user_settings');

	switch(select) {
		case 'InitialMonth':
		case 'SpreadsheetLocale':
		case 'FinancialCalendar':
		case 'OnlyEventsOwned':
		case 'PostDayEvents':
		case 'CashFlowEvents':
		case 'OverrideZero':
			user_settings[select] = value;
			break;

		default:
			console.error("optAddonSettings_Set_() : Switch case is default.", select);
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
