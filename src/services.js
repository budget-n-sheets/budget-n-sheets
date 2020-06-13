function onOpenInstallable_(e) {
	if (e.authMode != ScriptApp.AuthMode.FULL) return;

	try {
		loadCache_();
	} catch (err) {
		consoleLog_("error", "onOpenInstallable_()", err);
		return;
	}
}


function loadCache_() {
	const list = [ "class_version2", "user_settings", "spreadsheet_settings", "const_properties" ];
	var cache;

	for (var i = 0; i < list.length; i++) {
		cache = PropertiesService2.getProperty("document", list[i], "json");
		if (cache) CacheService2.put("document", list[i], "json", cache);
	}

	cache = PropertiesService2.getProperty("document", "is_installed", "string");
	cache = (cache ? true : false);
	CacheService2.put("document", "is_installed", "boolean", cache);

	getUserId_();
}


function onEdit_Main_(e) {
	console.log("onEdit_Main_(): continued.");
	onEditInstallable_(e);
}
function onEditInstallable_(e) {
	if (e.authMode != ScriptApp.AuthMode.FULL) return;
	else if (e.value == "") return;

	try {
		if (e.range.getSheet().getName() !== "Quick Actions") return;
	} catch (err) {
		consoleLog_('warn', '', err);
		return;
	}

	var row = e.range.getRow();
	var mm = [
		"January", "February", "March", "April",
		"May", "June", "July", "August",
		"September", "October", "November", "December"
	];

	mm = mm.indexOf(e.value);

	switch (row) {
		case 4:
			if (mm === -1) break;
			toolPicker_("AddBlankRows", MN_SHORT[mm]);
			break;
		case 5:
			if (mm === -1) break;
			toolPicker_("FormatAccount", mm);
			break;
		case 6:
			if (mm === -1) break;
			toolPicker_("UpdateCashFlow", mm);
			break;

		case 9:
			toolPicker_("AddBlankRows", "Cards");
			break;
		case 10:
			if (mm === -1) break;
			toolPicker_("FormatCards", mm);
			break;

		case 13:
			if (e.value == "Collapse") pagesView_("hide", 1);
			else if (e.value == "Expand") pagesView_("show");
			break;

		default:
			return;
	}

	e.range.setValue("");
}


function daily_Main_(e) {
	try {
		reinstallTriggers_();
	} catch (err) {
		return;
	}

	dailyTrigger_(e);
}
function dailyTrigger_(e) {
	if (isReAuthorizationRequired_()) return;
	if (! isInstalled_()) {
		uninstall_();
		return;
	}

	// if (SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetLocale() !== getSpreadsheetSettings_("spreadsheet_locale")) {
	// 	updateDecimalSepartor_();
	// }

	if (seamlessUpdate_()) return;

	var financial_year = getConstProperties_('financial_year');
	var date, a;

	if (e) {
		date = new Date(e["year"], e["month"] - 1, e["day-of-month"], e["hour"]);
		date = date.getSpreadsheetDate();
	} else {
		date = DATE_NOW.getSpreadsheetDate();
	}

	a = {
		"year": date.getFullYear(),
		"month": date.getMonth(),
		"date": date.getDate()
	};

	if (financial_year < a["year"]) {
		monthly_TreatLayout_(a["year"], a["month"]);
		deleteTrigger_('document', 'clockTriggerId');
		Utilities.sleep(300);
		createNewTrigger_("document", "clockTriggerId", "onWeekDay", "weekly_Foo_", 2);
		setSpreadsheetSettings_("operation_mode", "passive");

		console.info("add-on/mode-passive");
		return;
	}

	if (a["date"] == 1) {
		monthly_TreatLayout_(a["year"], a["month"]);
	}

	if (getUserSettings_("post_day_events")) {
		postEventsForDate_(date);
	}

	return;
}


function weekly_Foo_(e) {
	try {
		reinstallTriggers_();
	} catch (err) {
		return;
	}

	weeklyTriggerPos_(e);
}
function weeklyTriggerPos_(e) {
	if (isReAuthorizationRequired_()) return;
	if (! isInstalled_()) {
		uninstall_();
		return;
	}

	// if (SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetLocale() !== getSpreadsheetSettings_("spreadsheet_locale")) {
	// 	updateDecimalSepartor_();
	// }

	seamlessUpdate_();
}


function weekly_Bar_(e) {
	try {
		reinstallTriggers_();
	} catch (err) {
		return;
	}

	weeklyTriggerPre_(e);
}
function weeklyTriggerPre_(e) {
	if (isReAuthorizationRequired_()) return;
	if (! isInstalled_()) {
		uninstall_();
		return;
	}

	var date, a;

	if (e) {
		date = new Date(e["year"], e["month"] - 1, e["day-of-month"], e["hour"]);
		date = date.getSpreadsheetDate();
	} else {
		date = DATE_NOW.getSpreadsheetDate();
	}

	a = {
		year: date.getFullYear(),
		month: date.getMonth(),
		date: date.getDate()
	};

	// if (SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetLocale() !== getSpreadsheetSettings_("spreadsheet_locale")) {
	// 	updateDecimalSepartor_();
	// }

	if (seamlessUpdate_()) return;

	var financial_year = getConstProperties_('financial_year');

	if (a["year"] > financial_year) return;

	deleteTrigger_("document", "clockTriggerId");

	if (a["year"] == financial_year) {
		createNewTrigger_("document", "clockTriggerId", "everyDays", "daily_Main_", 1, 2);
		console.info("add-on/mode-active");
	} else {
		createNewTrigger_("document", "clockTriggerId", "onWeekDay", "weekly_Foo_", 2);
	}

	monthly_TreatLayout_(a["year"], a["month"]);
}
