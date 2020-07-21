function showDialogSetupAddon() {
	console.info("add-on/intent");
	setUserId_();
	setupFlow_("dialog");
}

function setupUi(settings, list_acc) {
	setupFlow_("setup", settings, list_acc);
}

function setupFlow_(select, settings, list_acc) {
	var lock = LockService.getDocumentLock();
	try {
		lock.waitLock(100);
	} catch (err) {
		SpreadsheetApp.getUi().alert(
			"Add-on setup in progress",
			"A budget spreadsheet setup is already in progress.",
			SpreadsheetApp.getUi().ButtonSet.OK);
		ConsoleLog.warn(err);
		return;
	}

	switch (select) {
		case "dialog":
			lock.releaseLock();
			showDialogSetupAddon_();
			break;
		case "setup":
      setup_(settings, list_acc);
			lock.releaseLock();
			break;

		default:
			throw new Error("Switch case is default.");
	}
}

function isInstalled_() {
	var isInstalled = CacheService2.get("document", "is_installed", "boolean");

	if (isInstalled == null) {
		isInstalled = PropertiesService2.getProperty("document", "is_installed", "string");
		isInstalled = (isInstalled ? true : false);
		CacheService2.put("document", "is_installed", "boolean", isInstalled);
	}

	return isInstalled;
}

function uninstall_(putLock) {
	var list = ScriptApp.getUserTriggers( SpreadsheetApp.getActiveSpreadsheet() );
	for (var i = 0; i < list.length; i++) {
		ScriptApp.deleteTrigger(list[i]);
	}

	CacheService2.removeAll("document", CACHE_KEYS);

	if (putLock) {
		PropertiesService.getDocumentProperties().setProperties({lock_spreadsheet: "true"}, true);
		console.info("add-on/uninstall-with-lock");
	} else {
		PropertiesService.getDocumentProperties().deleteAllProperties();
		console.info("add-on/uninstall");
	}
}


function setup_(settings, list_acc) {
  console.time('setup/time')
	SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
	var owner, user;

	if (! isTemplateAvailable()) throw new Error("Template is not available.");
	else if ( isInstalled_() ) throw new Error("Add-on is already installed.");
	else if (PropertiesService.getDocumentProperties().getProperty("lock_spreadsheet")) throw new Error("Spreadsheet is locked.");

	owner = SPREADSHEET.getOwner();
	if (owner) owner = owner.getEmail();
	else owner = "";

	user = Session.getEffectiveUser().getEmail();

	if (owner && owner !== user) throw new Error("Missing ownership rights.");
	else if (SPREADSHEET.getFormUrl()) throw new Error("Spreadsheet has a form linked.");


	var class_version2, yyyy_mm;

	SETUP_SETTINGS = {
		spreadsheet_name: settings.spreadsheet_name,
		financial_year: Number(settings.financial_year),
		init_month: Number(settings.initial_month),
		number_accounts: Number(settings.number_accounts),
		list_acc: list_acc,
		decimal_separator: true
	};

	SPREADSHEET.rename(SETUP_SETTINGS["spreadsheet_name"]);

	PropertiesService2.deleteAllProperties("document");
	deleteAllTriggers_();
	CacheService2.removeAll("document", CACHE_KEYS);

	deleteAllSheets_();
	copySheetsFromSource_();

	yyyy_mm = {
		time: DATE_NOW.getTime(),
		yyyy: DATE_NOW.getFullYear(),
		mm: DATE_NOW.getMonth()
	};

	setupSettings_(yyyy_mm);
	setupProperties_(yyyy_mm);
	setupTables_();
	setupMonthSheet_();
	setupBackstage_();
	setupSummary_();
	setupTags_();
	setupCards_();
	setupCashFlow_();
	setupWest_();
	setupEast_(yyyy_mm);

  try {
    setupTriggers_(yyyy_mm)
  } catch (err) {
    console.error(err)
  }

	class_version2 = {
		script: APPS_SCRIPT_GLOBAL.script_version,
		template: APPS_SCRIPT_GLOBAL.template_version
	};
	class_version2.script.beta = PATCH_THIS["beta_list"].length;
	PropertiesService2.setProperty("document", "class_version2", "json", class_version2);

	if (bsSignSetup_()) throw new Error("Failed to sign document.");

	SPREADSHEET.setActiveSheet(SPREADSHEET.getSheetByName("Summary"));
	PropertiesService2.setProperty("document", "is_installed", "boolean", true);
	showDialogSetupEnd();
	onOpen();

	SPREADSHEET = null;
	SETUP_SETTINGS = null;
  console.timeEnd('setup/time')
}
