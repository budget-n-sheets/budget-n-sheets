function onOpenInstallable_(e) {
	if (e.authMode != ScriptApp.AuthMode.FULL) return;

	loadCache_();
}


function loadCache_() {
	console.time("add-on/onOpen/load-cache");
	var cache = getCacheService_("document", "load_cache", "boolean");
	if (cache) return;

	const list = [ "class_version2", "user_settings", "spreadsheet_settings", "const_properties"];

	for (i = 0; i < list.length; i++) {
		cache = getPropertiesService_("document", "json", list[i]);
		if (!cache) continue;

		putCacheService_("document", list[i], "json", cache);
	}

	putCacheService_("document", "load_cache", "boolean", true);
	console.timeEnd("add-on/onOpen/load-cache");
}


function onEdit_Main_(e) {
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
			optMainTools_("AddBlankRows", mm);
			break;
		case 5:
			if (mm === -1) break;
			optMainTools_("FormatAccount", mm);
			break;
		case 6:
			if (mm === -1) break;
			optMainTools_("UpdateCashFlow", mm);
			break;

		case 9:
			optMainTools_("AddBlankRows", 12);
			break;
		case 10:
			if (mm === -1) break;
			optMainTools_("FormatCards", mm);
			break;

		case 13:
			if (e.value == "Collapse") optNavTools_("hide", "[ ]");
			else if (e.value == "Expand") optNavTools_("show");
			break;

		default:
			return;
	}

	e.range.setValue("");
}



function daily_Main_(e) {
	if (isReAuthorizationRequired_()) return;
	if (!getPropertiesService_('document', '', 'is_installed')) {
		uninstall_();
		return;
	}

	if (reviseVersion_()) return;

	// if (SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetLocale() !== getSpreadsheetSettings_("spreadsheet_locale")) {
	// 	updateDecimalSepartor_();
	// }

	if (seamlessUpdate_()) return;

	var financial_year = getConstProperties_('financial_year');
	var date, a;

	if (e) {
		date = new Date(e["year"], e["month"] - 1, e["day-of-month"], e["hour"]);
		date = getSpreadsheetDate(date);
	} else {
		date = getSpreadsheetDate();
	}

	a = {
		"year": date.getFullYear(),
		"month": date.getMonth(),
		"date": date.getDate()
	};

	if (financial_year < a["year"]) {
		monthly_TreatLayout_(a["year"], a["month"]);
		deleteScriptAppTriggers_('document', 'dailyMainId');
		Utilities.sleep(300);
		createScriptAppTriggers_("document", "weeklyMainId", "onWeekDay", "weekly_Foo_", 2);
		setSpreadsheetSettings_("operation_mode", "passive");

		console.info("add-on/mode-passive");
		return;
	}

	if (a["date"] == 1) {
		monthly_TreatLayout_(a["year"], a["month"]);
	}

	if (getUserSettings_("post_day_events")) {
		daily_PostEvents_(date);
	}

	return;
}


function weekly_Foo_(e) {
	if (isReAuthorizationRequired_()) return;
	if (!getPropertiesService_('document', '', 'is_installed')) {
		uninstall_();
		return;
	}

	if (reviseVersion_()) return;

	// if (SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetLocale() !== getSpreadsheetSettings_("spreadsheet_locale")) {
	// 	updateDecimalSepartor_();
	// }

	seamlessUpdate_();
}


function weekly_Bar_(e) {
	if (isReAuthorizationRequired_()) return;
	if (!getPropertiesService_('document', '', 'is_installed')) {
		uninstall_();
		return;
	}

	if (reviseVersion_()) return;

	var date, a;

	if (e) {
		date = new Date(e["year"], e["month"] - 1, e["day-of-month"], e["hour"]);
		date = getSpreadsheetDate(date);
	} else {
		date = getSpreadsheetDate();
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

	deleteScriptAppTriggers_("document", "weeklyMainId");

	if (a["year"] == financial_year) {
		createScriptAppTriggers_("document", "dailyMainId", "everyDays", "daily_Main_", 1, 2);
		console.info("add-on/mode-active");
	} else {
		createScriptAppTriggers_("document", "weeklyMainId", "onWeekDay", "weekly_Foo_", 2);
	}

	monthly_TreatLayout_(a["year"], a["month"]);
}


function reviseVersion_() {
	var documentProperties = PropertiesService.getDocumentProperties();

	if (documentProperties.getProperty("class_version2") == null) {
			console.log("Version revision failed: uninstall.");
			uninstall_();
			return 1;
	}
}


function reviseUser_() {
	var user = getPropertiesService_("user", "string", "user_id");
	if (user) return;

	try {
		user = Session.getEffectiveUser().getEmail();
	} catch (err) {
		console.warn(err);
		user = "";
	}

	if (user) user = computeDigest("SHA_256", user, "UTF_8");

	setPropertiesService_("user", "string", "user_id", user);
}
