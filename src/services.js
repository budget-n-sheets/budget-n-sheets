function onOpenInstallable_(e) {
	if (e.authMode != ScriptApp.AuthMode.FULL) return;

	try {
		loadCache_();
	} catch (err) {
		consoleLog_("error", "loadCache_()", err);
	}
}

function loadCache_() {
	var isLoaded = CacheService2.get("document", "load_cache", "boolean");
	if (isLoaded) return;

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

	CacheService2.put("document", "load_cache", "boolean", true);
}

function onEditInstallable_(e) {
	if (e.authMode != ScriptApp.AuthMode.FULL) return;

	try {
		if (e.range.getSheet().getName() === "Quick Actions") quickActions_(e.range, e.value);
	} catch (err) {
		consoleLog_("error", "quickActions_()", err);
	} finally {
		e.range.setValue("");
	}
}

function quickActions_(range, value) {
	if (value == "") return;

	const row = range.getRow();

	switch (row) {
	case 9:
		toolPicker_("AddBlankRows", "Cards");
		break;
	case 13:
		if (value == "Collapse") pagesView_("hide", 1);
		else if (value == "Expand") pagesView_("show");
		break;

	default:
		break;
	}

	const mm = MN_SHORT.indexOf(value);
	if (mm === -1) return;

	switch (row) {
	case 4:
		toolPicker_("AddBlankRows", MN_SHORT[mm]);
		break;
	case 5:
		toolPicker_("FormatAccount", mm);
		break;
	case 6:
		toolPicker_("UpdateCashFlow", mm);
		break;

	case 10:
		toolPicker_("FormatCards", mm);
		break;

	default:
		break;
	}
}

function dailyTrigger_(e) {
	if (isReAuthorizationRequired_()) return;
	if (! isInstalled_()) return;

	if (seamlessUpdate_()) return;

	var date = DATE_NOW.getSpreadsheetDate();
	date = {
		year: date.getFullYear(),
		month: date.getMonth(),
		date: date.getDate()
	};

	const financial_year = getConstProperties_("financial_year");

	if (financial_year < date.year) {
		monthly_TreatLayout_(date.year, date.month);
		deleteTrigger_("document", "clockTriggerId");
		Utilities.sleep(300);

		createNewTrigger_("document", "clockTriggerId", "onWeekDay", "weekly_Foo_", 2);
		setSpreadsheetSettings_("operation_mode", "passive");

		console.info("mode/passive");
		return;
	}

	if (date.date === 1) {
		monthly_TreatLayout_(date.year, date.month);
	}

	if (getUserSettings_("post_day_events")) {
		postEventsForDate_(date);
	}
}

function weeklyTriggerPos_(e) {
	if (isReAuthorizationRequired_()) return;
	if (! isInstalled_()) return;

	seamlessUpdate_();
}

function weeklyTriggerPre_(e) {
	if (isReAuthorizationRequired_()) return;
	if (! isInstalled_()) return;

	if (seamlessUpdate_()) return;

	var date = DATE_NOW.getSpreadsheetDate();
	date = {
		year: date.getFullYear(),
		month: date.getMonth()
	};

	const financial_year = getConstProperties_("financial_year");

	if (date.year > financial_year) return;

	deleteTrigger_("document", "clockTriggerId");

	if (date.year === financial_year) {
		createNewTrigger_("document", "clockTriggerId", "everyDays", "daily_Main_", 1, 2);
		console.info("mode/active");
	} else {
		createNewTrigger_("document", "clockTriggerId", "onWeekDay", "weekly_Foo_", 2);
	}

	monthly_TreatLayout_(date.year, date.month);
}
