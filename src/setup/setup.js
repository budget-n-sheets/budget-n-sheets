function setupService (uuid, payload) {
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

  console.time('setup/' + payload.protocol);
  if (SetupService.checkRequirements() !== 0) throw new Error('Failed to pass requirements check.');

  const config = {};
  const list_accounts = [];

  if (payload.protocol === 'new') {
    for (const key in payload.config) {
      config[key] = payload.config[key];
    }

    config.spreadsheet_name = config.spreadsheet_name.trim();
    if (config.spreadsheet_name === '') throw new Error('Invalid spreadsheet name.');

    for (let i = 0; i < payload.config.name_accounts.length; i++) {
      list_accounts[i] = payload.config.name_accounts[i].trim();
      if (list_accounts[i] === '') throw new Error('Invalid account name.');
    }
  } else if (payload.protocol === 'restore') {
    const candidate = PropertiesService3.document().getProperty('settings_candidate');
    if (candidate.file_id !== payload.config.file_id) throw new Error('File ID does not match.');

    const blob = DriveApp.getFileById(payload.config.file_id).getBlob();
    config.backup = unwrapBackup_(uuid, blob, payload.config.file_id);
    if (config.backup == null) return;

    for (const key in candidate) {
      config[key] = candidate[key];
    }

    config.spreadsheet_name = candidate.spreadsheet_title;
    config.financial_year = payload.config.financial_year;

    for (let i = 0; i < candidate.list_acc.length; i++) {
      list_accounts[i] = candidate.list_acc[i];
    }
  } else if (payload.protocol === 'copy') {
    const candidate = PropertiesService3.document().getProperty('settings_candidate');
    if (candidate.file_id !== payload.config.file_id) throw new Error('File ID does not match.');

    for (const key in candidate) {
      config[key] = candidate[key];
    }

    config.spreadsheet_name = candidate.spreadsheet_title;
    config.financial_year = payload.config.financial_year;
    config.decimal_places = 2;
    config.number_accounts = candidate.accounts.length;
    config.file_id = candidate.file_id;

    for (let i = 0; i < candidate.accounts.length; i++) {
      list_accounts[i] = candidate.accounts[i];
    }
  }

  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  spreadsheet.rename(config.spreadsheet_name);

  new SetupProgress().makeClean()
    .makeConfig(config)
    .copyTemplate()
    .makeInstall();

  if (payload.protocol === 'restore') {
    restoreFromBackup_(config.backup);
  } else if (payload.protocol === 'copy') {
    restoreFromSpreadsheet_(config.file_id);
  }

  const class_version2 = {
    script: APPS_SCRIPT_GLOBAL.script_version,
    template: APPS_SCRIPT_GLOBAL.template_version
  };
  class_version2.script.beta = PATCH_THIS.beta_list.length;
  PropertiesService3.document().setProperty('class_version2', class_version2);

  new BsAuth(spreadsheet).update();

  spreadsheet.setActiveSheet(spreadsheet.getSheetByName('Summary'));
  PropertiesService3.document().setProperty('is_installed', true);

  try {
    TriggersService.start();
  } catch (err) {
    console.error(err);
  }

  showDialogSetupEnd();
  onOpen();

  console.timeEnd('setup/' + payload.protocol);
}

function setupPrepare_ (spreadseetName) {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  spreadsheet.rename(spreadseetName);

  PropertiesService3.document().deleteAllProperties();
  CacheService3.document().removeAll(CACHE_KEYS);

  Triggers.deleteAllUserTriggers();

  const metadata = spreadsheet.createDeveloperMetadataFinder()
    .withVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
    .find();

  for (let i = 0; i < metadata.length; i++) {
    metadata[i].remove();
  }

  deleteAllSheets_();
  copySheetsFromSource_();
}
