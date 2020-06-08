function onOpenInstallable_(e) {
	if (e.authMode != ScriptApp.AuthMode.FULL) return;

	loadCache_();
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
		askReinstall();
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
		askReinstall();
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
		askReinstall();
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

function askDeactivation() {
	if (! isInstalled_()) {
		uninstall_();
		onOpen();
		return true;
	}

	var ui = SpreadsheetApp.getUi();

	if (getUserId_() !== classAdminSettings_("get", "admin_id")) {
		ui.alert(
			"Permission denied",
			"You don't have permission to deactivate the add-on.",
			ui.ButtonSet.OK);
		return;
	}

	var response = ui.alert(
			"Deactivate the add-on?",
			"You can't undo this action!",
			ui.ButtonSet.YES_NO);

	if (response == ui.Button.YES) {
		uninstall_(true);
		onOpen();

		ui.alert(
			"Deactivation complete",
			"The add-on was deactivated.",
			ui.ButtonSet.OK);

		console.info("deactivate");
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
	if (! isInstalled_()) return;

	if (getUserId_() !== classAdminSettings_("get", "admin_id")) {
		SpreadsheetApp.getUi().alert(
			"Permission denied",
			"You don't have permission to reinstall the triggers.",
			SpreadsheetApp.getUi().ButtonSet.OK);
		return 1;
	}

	const financial_year = getConstProperties_("financial_year");

	var yyyy = DATE_NOW.getSpreadsheetDate().getFullYear();
	var operation, dd;

	deleteAllTriggers_();

	if (financial_year < yyyy) {
		createNewTrigger_("document", "clockTriggerId", "onWeekDay", "weeklyTriggerPos_", 2);
		operation = "passive";

	} else if (financial_year == yyyy) {
		createNewTrigger_("document", "clockTriggerId", "everyDays", "dailyTrigger_", 1, 2);
		operation = "active";

	} else if (financial_year > yyyy) {
		dd = new Date(financial_year, 0, 2).getDay();
		createNewTrigger_("document", "clockTriggerId", "onWeekDay", "weeklyTriggerPre_", dd);
		operation = "passive";

	} else {
		console.warn("askReinstall(): Case is default.");
	}

	setSpreadsheetSettings_("operation_mode", operation);

	createNewTrigger_("document", "onEditTriggerId", "onEdit", "onEditInstallable_");
	createNewTrigger_("document", "onOpenTriggerId", "onOpen", "onOpenInstallable_");
}


function askUninstall() {
	deleteAllTriggers_();
}
