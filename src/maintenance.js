function askUninstall() {
	deleteAllTriggers_();
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
