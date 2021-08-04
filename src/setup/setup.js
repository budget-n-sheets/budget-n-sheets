function setupLock (uuid, select, config) {
  const lock = LockService.getDocumentLock();
  try {
    lock.waitLock(200);
  } catch (err) {
    SpreadsheetApp2.getUi().alert(
      'Add-on setup in progress',
      'A budget spreadsheet setup is already in progress.',
      SpreadsheetApp2.getUi().ButtonSet.OK);
    console.warn(err);
    return;
  }

  if (!CacheService3.user().get(uuid)) {
    showSessionExpired();
    return;
  }
  CacheService3.user().remove(uuid);

  console.time('setup/' + select);
  if (SetupService.checkRequirements() !== 0) throw new Error('Failed to pass requirements check.');

  const settings = {};
  const list_accounts = [];

  if (select === 'new') {
    for (const key in config) {
      settings[key] = config[key];
    }

    settings.spreadsheet_name = settings.spreadsheet_name.trim();
    if (settings.spreadsheet_name === '') throw new Error('Invalid spreadsheet name.');

    for (let i = 0; i < config.name_accounts.length; i++) {
      list_accounts[i] = config.name_accounts[i].trim();
      if (list_accounts[i] === '') throw new Error('Invalid account name.');
    }
  } else if (select === 'restore') {
    const candidate = PropertiesService3.document().getProperty('settings_candidate');
    if (candidate.file_id !== config.file_id) throw new Error('File ID does not match.');

    const blob = DriveApp.getFileById(config.file_id).getBlob();
    settings.backup = unwrapBackup_(uuid, blob, config.file_id);
    if (settings.backup == null) return;

    for (const key in candidate) {
      settings[key] = candidate[key];
    }

    settings.spreadsheet_name = candidate.spreadsheet_title;
    settings.financial_year = config.financial_year;

    for (let i = 0; i < candidate.list_acc.length; i++) {
      list_accounts[i] = candidate.list_acc[i];
    }
  } else if (select === 'copy') {
    const candidate = PropertiesService3.document().getProperty('settings_candidate');
    if (candidate.file_id !== config.file_id) throw new Error('File ID does not match.');

    for (const key in candidate) {
      settings[key] = candidate[key];
    }

    settings.spreadsheet_name = candidate.spreadsheet_title;
    settings.financial_year = config.financial_year;
    settings.decimal_places = 2;
    settings.number_accounts = candidate.accounts.length;
    settings.file_id = candidate.file_id;

    for (let i = 0; i < candidate.accounts.length; i++) {
      list_accounts[i] = candidate.accounts[i];
    }
  }

  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();

  const dec_p = Number(settings.decimal_places);
  const dec_c = (dec_p > 0 ? '.' + '0'.repeat(dec_p) : '');
  const number_format = '#,##0' + dec_c + ';' + '(#,##0' + dec_c + ')';

  CachedAccess.update('setup_settings', {
    date: {
      time: DATE_NOW.getTime(),
      yyyy: DATE_NOW.getFullYear(),
      mm: DATE_NOW.getMonth()
    },
    spreadsheet_name: settings.spreadsheet_name,
    decimal_places: dec_p,
    number_format: number_format,
    financial_year: Number(settings.financial_year),
    init_month: Number(settings.initial_month),
    number_accounts: Number(settings.number_accounts),
    list_acc: list_accounts,
    decimal_separator: true
  });

  setupPrepare_(settings.spreadsheet_name);
  setupParts_();

  CachedAccess.remove('setup_settings');

  if (select === 'restore') {
    restoreFromBackup_(settings.backup);
  } else if (select === 'copy') {
    restoreFromSpreadsheet_(settings.file_id);
  }

  const class_version2 = {
    script: APPS_SCRIPT_GLOBAL.script_version,
    template: APPS_SCRIPT_GLOBAL.template_version
  };
  class_version2.script.beta = PATCH_THIS.beta_list.length;
  PropertiesService3.document().setProperty('class_version2', class_version2);

  if (bsSignSetup_()) throw new Error('Failed to sign document.');

  try {
    setupTriggers_();
  } catch (err) {
    console.error(err);
  }

  spreadsheet.setActiveSheet(spreadsheet.getSheetByName('Summary'));
  PropertiesService3.document().setProperty('is_installed', true);

  showDialogSetupEnd();
  onOpen();

  console.timeEnd('setup/' + select);
}

function setupPrepare_ (spreadseetName) {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  spreadsheet.rename(spreadseetName);

  PropertiesService3.document().deleteAllProperties();
  deleteAllTriggers_();
  CacheService3.document().removeAll(CACHE_KEYS);

  const metadata = spreadsheet.createDeveloperMetadataFinder()
    .withVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
    .find();

  for (let i = 0; i < metadata.length; i++) {
    metadata[i].remove();
  }

  deleteAllSheets_();
  copySheetsFromSource_();
}

function setupParts_ () {
  setupProperties_();
  setupTables_();

  setupSettings_();
  setupMonthSheet_();
  setupUnique_();
  setupBackstage_();
  setupSummary_();
  setupTags_();
  setupCards_();
  setupCashFlow_();
  setupWest_();
  setupEast_();
}
