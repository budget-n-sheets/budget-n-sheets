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
	deleteAllTriggers_()

	CacheService2.removeAll("document", CACHE_KEYS);

	if (putLock) {
		PropertiesService.getDocumentProperties().setProperties({lock_spreadsheet: "true"}, true);
		console.log("uninstall-with-lock");
	} else {
		PropertiesService.getDocumentProperties().deleteAllProperties();
		console.log("uninstall");
	}
}

function setupLock (select, param1, param2) {
  var lock = LockService.getDocumentLock();
  try {
    lock.waitLock(200);
  } catch (err) {
    SpreadsheetApp.getUi().alert(
      'Add-on setup in progress',
      'A budget spreadsheet setup is already in progress.',
      SpreadsheetApp.getUi().ButtonSet.OK);
    ConsoleLog.warn(err);
    return;
  }

  if (select === 'new') return setupNew_(param1, param2);
  if (select === 'restore') return setupRestore_(param1);
	if (select === 'copy') return setupCopy_(param1);
}

function setupNew_ (settings, list_acc) {
  console.time('setup/new');
	SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();

  setupValidate_();

	SETUP_SETTINGS = {
		spreadsheet_name: settings.spreadsheet_name,
		decimal_places: Number(settings.decimal_places),
		number_format: '#,##0.00;(#,##0.00)',
		financial_year: Number(settings.financial_year),
		init_month: Number(settings.initial_month),
		number_accounts: Number(settings.number_accounts),
		list_acc: list_acc,
		decimal_separator: true
	};

  const dec_p = SETUP_SETTINGS['decimal_places'];
  const dec_c = (dec_p > 0 ? '.' + '0'.repeat(dec_p) : '');
  SETUP_SETTINGS['number_format'] = '#,##0' + dec_c + ';' + '(#,##0' + dec_c + ')';

  setupPrepare_();
  setupParts_();

	const class_version2 = {
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
  console.timeEnd('setup/new')
}

function setupRestore_ (fileId) {
  console.time('setup/restore');

  const settings_candidate = PropertiesService2.getProperty('document', 'settings_candidate', 'json');
  if (settings_candidate.file_id !== fileId) return 2;

  const backup = settings_candidate.backup;

  const list_acc = [];
  for (var i in backup.db_tables.accounts) {
    list_acc.push(backup.db_tables.accounts[i].name);
  }

  SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();

  setupValidate_();

  SETUP_SETTINGS = {
    spreadsheet_name: backup.backup.spreadsheet_title,
    decimal_places: backup.spreadsheet_settings.decimal_places,
    number_format: '#,##0.00;(#,##0.00)',
    financial_year: backup.const_properties.financial_year,
    init_month: backup.user_settings.initial_month,
    number_accounts: backup.const_properties.number_accounts,
    list_acc: list_acc,
    decimal_separator: true
  };

  const dec_p = SETUP_SETTINGS['decimal_places'];
  const dec_c = (dec_p > 0 ? '.' + '0'.repeat(dec_p) : '');
  SETUP_SETTINGS['number_format'] = '#,##0' + dec_c + ';' + '(#,##0' + dec_c + ')';

  setupPrepare_();
  setupParts_();

  const class_version2 = {
    script: APPS_SCRIPT_GLOBAL.script_version,
    template: APPS_SCRIPT_GLOBAL.template_version
  };
  class_version2.script.beta = PATCH_THIS['beta_list'].length;
  PropertiesService2.setProperty('document', 'class_version2', 'json', class_version2);

  if (bsSignSetup_()) throw new Error('Failed to sign document.');

  SPREADSHEET.setActiveSheet(SPREADSHEET.getSheetByName('Summary'));
  PropertiesService2.setProperty('document', 'is_installed', 'boolean', true);

  restoreFromBackup_(backup);

  showDialogSetupEnd();
  onOpen();

  SPREADSHEET = null;
  SETUP_SETTINGS = null;
  console.timeEnd('setup/restore');
}

function setupCopy_ (fileId) {
  console.time('setup/copy');

  const settings_candidate = PropertiesService2.getProperty('document', 'settings_pc', 'json');

  SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();

  setupValidate_();

  SETUP_SETTINGS = {
    spreadsheet_name: settings_candidate.spreadsheet_title,
    decimal_places: 2,
    number_format: '#,##0.00;(#,##0.00)',
    financial_year: settings_candidate.financial_year,
    init_month: settings_candidate.initial_month,
    number_accounts: settings_candidate.accounts.length,
    list_acc: settings_candidate.accounts,
    decimal_separator: true
  };

  setupPrepare_();
  setupParts_();

  const class_version2 = {
    script: APPS_SCRIPT_GLOBAL.script_version,
    template: APPS_SCRIPT_GLOBAL.template_version
  };
  class_version2.script.beta = PATCH_THIS.beta_list.length;
  PropertiesService2.setProperty('document', 'class_version2', 'json', class_version2);

  if (bsSignSetup_()) throw new Error('Failed to sign document.');

  SPREADSHEET.setActiveSheet(SPREADSHEET.getSheetByName('Summary'));
  PropertiesService2.setProperty('document', 'is_installed', 'boolean', true);

  showDialogSetupEnd();
  onOpen();

  SPREADSHEET = null;
  SETUP_SETTINGS = null;
  console.timeEnd('setup/copy');
}

function setupValidate_ () {
  if (!isTemplateAvailable()) throw new Error('Template is not available.');
  if (isInstalled_()) throw new Error('Add-on is already installed.');
  if (PropertiesService2.getProperty('document', 'lock_spreadsheet', 'boolean')) throw new Error('Spreadsheet is locked.');

  var owner = SPREADSHEET.getOwner();
  if (owner) owner = owner.getEmail();
  else owner = '';

  const user = Session.getEffectiveUser().getEmail();

  if (owner && owner !== user) throw new Error('Missing ownership rights.');
  if (SPREADSHEET.getFormUrl()) throw new Error('Spreadsheet has a form linked.');
}

function setupPrepare_ () {
  SPREADSHEET.rename(SETUP_SETTINGS['spreadsheet_name']);

  PropertiesService2.deleteAllProperties('document');
  deleteAllTriggers_();
  CacheService2.removeAll('document', CACHE_KEYS);

  deleteAllSheets_();
  copySheetsFromSource_();
}

function setupParts_ () {
  const yyyy_mm = {
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
    setupTriggers_();
  } catch (err) {
    ConsoleLog.error(err);
  }
}
