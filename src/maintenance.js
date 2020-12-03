function askOptimizeAll () {
  switchActivity_('suspend');
}

function askSetRecalculation () {
  SpreadsheetApp.getActiveSpreadsheet().setRecalculationInterval(SpreadsheetApp.RecalculationInterval.HOUR);
}

function rollOperationMode_ (mode) {
  const hour = 2 + randomInteger(4);
  var trigger;

  deleteTrigger_('KeyId', { scope: 'document', key: 'clockTriggerId' });

  if (mode === 'passive') {
    const day = 1 + randomInteger(28);

    trigger = createNewTrigger_('weeklyTriggerPos_', 'onMonthDay', { days: day, hour: hour, minute: -1 });
    saveTriggerId_(trigger, 'document', 'clockTriggerId');
    console.log('mode/passive');
  } else {
    trigger = createNewTrigger_('dailyTrigger_', 'everyDays', { days: 1, hour: hour, minute: -1 });
    saveTriggerId_(trigger, 'document', 'clockTriggerId');
    console.log('mode/active');
  }

  setSpreadsheetSettings_('operation_mode', 'mode');
}

function askDeactivation() {
	if (! isInstalled_()) {
		uninstall_();
		onOpen();
		return true;
	}

	var ui = SpreadsheetApp.getUi();

	if (!isUserAdmin_()) {
		ui.alert(
			"Permission denied",
			"You don't have permission to deactivate the add-on.",
			ui.ButtonSet.OK);
		return;
	}

  const response1 = ui.alert(
    "Deactivate the add-on",
    "The deactivation affects only this spreadsheet: " + SpreadsheetApp.getActiveSpreadsheet().getName() + ".\n\n" +
    "By deactivating the add-on:\n" +
    "- All add-on features are disabled.\n" +
    "- Updates and maintenance cease.\n" +
    "- Data and functions are unaffected.\n" +
    "- This action cannot be undone.\n\n" +
    "For more information, visit the wiki.\n" +
    "Click OK to continue.",
    ui.ButtonSet.OK_CANCEL);
  if (response1 !== ui.Button.OK) return;

  const response2 = ui.alert(
    "Deactivate the add-on?",
    "You can't undo this action!",
    ui.ButtonSet.YES_NO);
  if (response2 !== ui.Button.YES) return;

  uninstall_(true);
  onOpen();

  ui.alert(
    "Deactivation complete",
    "The add-on was deactivated.",
    ui.ButtonSet.OK);

	console.log("deactivate");
	return true;
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

function askReinstallTriggersUi() {
	if (!isUserAdmin_()) {
		SpreadsheetApp.getUi().alert(
			"Permission denied",
			"You don't have permission to reinstall the triggers.",
			SpreadsheetApp.getUi().ButtonSet.OK);
		return 1;
	}

	reinstallTriggers_();
}

function reinstallTriggers_() {
	if (! isInstalled_()) return;

	var yyyy = getSpreadsheetDate.call(DATE_NOW).getFullYear();
	var trigger, operation, day

	const hour = 2 + randomInteger(4);
	const financial_year = getConstProperties_("financial_year");

	deleteAllTriggers_();

	if (financial_year < yyyy) {
		day = 1 + randomInteger(28);
		trigger = createNewTrigger_('weeklyTriggerPos_', 'onMonthDay', { days: day, hour: hour, minute: -1 })
		operation = "passive";

	} else if (financial_year == yyyy) {
		trigger = createNewTrigger_('dailyTrigger_', 'everyDays', { days: 1, hour: hour, minute: -1 })
		operation = "active";

	} else if (financial_year > yyyy) {
		day = new Date(financial_year, 0, 2).getDay();
		trigger = createNewTrigger_('weeklyTriggerPre_', 'onWeekDay', { weeks: 1, week: day, hour: hour, minute: -1 })
		operation = "passive";

	} else {
		ConsoleLog.warn("reinstallTriggers_(): Case is default.");
	}

  saveTriggerId_(trigger, 'document', 'clockTriggerId')
	setSpreadsheetSettings_("operation_mode", operation);

	trigger = createNewTrigger_('onEditInstallable_', 'onEdit')
  saveTriggerId_(trigger, 'document', 'onEditTriggerId')

	trigger = createNewTrigger_('onOpenInstallable_', 'onOpen')
  saveTriggerId_(trigger, 'document', 'onOpenTriggerId')
}
