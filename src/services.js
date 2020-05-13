function onOpenInstallable_(e) {
	if (e.authMode != ScriptApp.AuthMode.FULL) return;

	loadCache_();
}


function loadCache_() {
	console.time("add-on/onOpen/load-cache");
	const list = [ "class_version2", "user_settings", "spreadsheet_settings", "const_properties"];

	for (var i = 0; i < list.length; i++) {
		var cache = PropertiesService2.getProperty("document", list[i], "json");
		if (cache) CacheService2.put("document", list[i], "json", cache);
	}
	console.timeEnd("add-on/onOpen/load-cache");
}


function onEdit_Main_(e) {
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
	dailyTrigger_(e);
}
function dailyTrigger_(e) {
	if (isReAuthorizationRequired_()) return;
	if (!PropertiesService.getDocumentProperties().getProperty("is_installed")) {
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
	weeklyTriggerPos_(e);
}
function weeklyTriggerPos_(e) {
	if (isReAuthorizationRequired_()) return;
	if (!PropertiesService.getDocumentProperties().getProperty("is_installed")) {
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
	weeklyTriggerPre_(e);
}
function weeklyTriggerPre_(e) {
	if (isReAuthorizationRequired_()) return;
	if (!PropertiesService.getDocumentProperties().getProperty("is_installed")) {
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
	var user = PropertiesService2.getProperty("user", "user_id", "string");
	if (user) return;

	try {
		user = Session.getEffectiveUser().getEmail();
	} catch (err) {
		console.warn(err);
		user = "";
	}

	if (user) user = computeDigest("SHA_256", user, "UTF_8");

	PropertiesService2.setProperty("user", "user_id", "string", user);
}


function askDeactivation() {
	var Ui = SpreadsheetApp.getUi(); // Same variations.
	var s = randomString(5, "upnum");

	var result = Ui.prompt(
			"Deactivate add-on",
			"This action cannot be undone!\nPlease type in the code " + s + " to confirm:",
			Ui.ButtonSet.OK_CANCEL);

	var button = result.getSelectedButton();
	var text = result.getResponseText();
	if (button == Ui.Button.OK && text === s) {
		uninstallAndLock_();
		onOpen();
		console.info("add-on/deactivate");
		return true;
	}
}


function askResetProtection() {
	var lock = LockService.getDocumentLock();
	try {
		lock.waitLock(200);
	} catch (err) {
		return;
	}

	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var sheet, ranges, range;
	var protections, protection;
	var n, i, j, k;

	number_accounts = getConstProperties_("number_accounts");

	for (i = 0; i < 12; i++) {
		sheet = spreadsheet.getSheetByName(MN_SHORT[i]);
		if (!sheet) continue;

		n = sheet.getMaxRows() - 4;
		if (n < 1) continue;
		if (sheet.getMaxColumns() < 5*(1 + number_accounts)) continue;

		protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
		for (j = 0; j < protections.length; j++) {
			protection = protections[j];
			if (protection.canEdit()) protection.remove();
		}

		ranges = [ ];
		for (k = 0; k < 1 + number_accounts; k++) {
			range = sheet.getRange(5, 1 + 5*k, n, 4);
			ranges.push(range);
		}

		sheet.protect()
			.setUnprotectedRanges(ranges)
			.setWarningOnly(true);
	}


	sheet = spreadsheet.getSheetByName("Cards");

	if (sheet) n = sheet.getMaxRows() - 5;
	else n = -1;

	if (n > 0 && sheet.getMaxColumns() >= 72) {
		protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
		for (j = 0; j < protections.length; j++) {
			protection = protections[j];
			if (protection.canEdit()) protection.remove();
		}

		ranges = [ ];

		for (i = 0; i < 12; i++) {
			range = sheet.getRange(6, 1 + 6*i, n, 5);
			ranges.push(range);

			range = sheet.getRange(2, 1 + 6*i, 1, 3);
			ranges.push(range);
		}

		sheet.protect()
			.setUnprotectedRanges(ranges)
			.setWarningOnly(true);
	}


	sheet = spreadsheet.getSheetByName("Tags");

	if (sheet) n = sheet.getMaxRows() - 1;
	else n = -1;

	if (n > 0) {
		protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
		for (j = 0; j < protections.length; j++) {
			protection = protections[j];
			if (protection.canEdit()) protection.remove();
		}

		range = sheet.getRange(2, 1, n, 5);
		sheet.protect()
			.setUnprotectedRanges([ range ])
			.setWarningOnly(true);
	}

	lock.releaseLock();
}


function askReinstall() {
	if (!PropertiesService.getDocumentProperties().getProperty("is_installed")) return;

	var financial_year = getConstProperties_("financial_year");
	var date = getSpreadsheetDate();
	var d;

	purgeScriptAppTriggers_();

	createScriptAppTriggers_("document", "onEditMainId", "onEdit", "onEditInstallable_");
	createScriptAppTriggers_("document", "onOpenTriggerId", "onOpen", "onOpenInstallable_");

	if (financial_year < date.getFullYear()) {
		setSpreadsheetSettings_("operation_mode", "passive");
		createScriptAppTriggers_("document", "weeklyMainId", "onWeekDay", "weeklyTriggerPos_", 2);

	} else if (financial_year === date.getFullYear()) {
		setSpreadsheetSettings_("operation_mode", "active");
		createScriptAppTriggers_("document", "dailyMainId", "everyDays", "dailyTrigger_", 1, 2);

	} else if (financial_year > date.getFullYear()) {
		d = new Date(financial_year, 0, 2);
		d = d.getDay();
		setSpreadsheetSettings_("operation_mode", "passive");
		createScriptAppTriggers_("document", "weeklyMainId", "onWeekDay", "weeklyTriggerPre_", d);
	}
}
