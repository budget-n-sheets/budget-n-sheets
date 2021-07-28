function isInstalled_ () {
  let isInstalled = CacheService3.document().get('is_installed');

  if (isInstalled == null) {
    isInstalled = PropertiesService3.document().getProperty('is_installed');
    isInstalled = (!!isInstalled);
    CacheService3.document().put('is_installed', isInstalled);
  }

  return isInstalled;
}

function uninstall_ (putLock) {
  deleteAllTriggers_();

  CacheService3.document().removeAll(CACHE_KEYS);

  if (putLock) {
    PropertiesService.getDocumentProperties().setProperties({ lock_spreadsheet: 'true' }, true);
  } else {
    PropertiesService.getDocumentProperties().deleteAllProperties();
  }
}

function conditionalInstallTest_ () {
  const ui = SpreadsheetApp2.getUi();

  if (!isTemplateAvailable()) {
    ui.alert(
      'New version available',
      'Please, re-open the spreadsheet to update the add-on.',
      ui.ButtonSet.OK);
    return true;
  } else if (isInstalled_()) {
    showDialogSetupEnd();
    onOpen();
    return true;
  } else if (PropertiesService.getDocumentProperties().getProperty('lock_spreadsheet')) {
    ui.alert(
      "Can't create budget sheet",
      'The add-on was previously deactivated in this spreadsheet which is now locked.\nPlease start in a new spreadsheet.',
      ui.ButtonSet.OK);
    return true;
  }

  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  let owner;

  owner = spreadsheet.getOwner();
  if (owner) owner = owner.getEmail();
  else owner = '';

  const user = Session.getEffectiveUser().getEmail();

  if (owner && owner !== user) {
    ui.alert(
      'Permission denied',
      "You don't own the spreadsheet. Please start in a new spreadsheet.",
      ui.ButtonSet.OK);
    return true;
  } else if (spreadsheet.getFormUrl()) {
    ui.alert(
      'Linked form',
      'The spreadsheet has a linked form. Please unlink the form first, or create a new spreadsheet.',
      ui.ButtonSet.OK);
    return true;
  }

  ui.alert(
    'Notice',
    `Due to a bug with Google Sheets, if you experience
    any issues with the "Start budget spreadsheet" dialog,
    please use your browser in incognito/private mode
    and try again.

    Learn more at budgetnsheets.com/notice-to-x-frame`,
    ui.ButtonSet.OK);

  return false;
}

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
  setupValidate_(select);

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

  SETUP_SETTINGS = {
    spreadsheet_name: settings.spreadsheet_name,
    decimal_places: Number(settings.decimal_places),
    number_format: '#,##0.00;(#,##0.00)',
    financial_year: Number(settings.financial_year),
    init_month: Number(settings.initial_month),
    number_accounts: Number(settings.number_accounts),
    list_acc: list_accounts,
    decimal_separator: true
  };

  const dec_p = SETUP_SETTINGS.decimal_places;
  const dec_c = (dec_p > 0 ? '.' + '0'.repeat(dec_p) : '');
  SETUP_SETTINGS.number_format = '#,##0' + dec_c + ';' + '(#,##0' + dec_c + ')';

  setupPrepare_();
  setupParts_();

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

  SETUP_SETTINGS = null;
  console.timeEnd('setup/' + select);
}

function setupValidate_ (select) {
  if (!isTemplateAvailable()) throw new Error('Template is not available.');
  if (isInstalled_()) throw new Error('Add-on is already installed.');
  if (PropertiesService3.document().getProperty('lock_spreadsheet')) throw new Error('Spreadsheet is locked.');

  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();

  let owner = spreadsheet.getOwner();
  if (owner) owner = owner.getEmail();
  else owner = '';

  const user = Session.getEffectiveUser().getEmail();

  if (owner && owner !== user) throw new Error('Missing ownership rights.');
  if (spreadsheet.getFormUrl()) throw new Error('Spreadsheet has a form linked.');
}

function setupPrepare_ () {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  spreadsheet.rename(SETUP_SETTINGS.spreadsheet_name);

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
  const yyyy_mm = {
    time: DATE_NOW.getTime(),
    yyyy: DATE_NOW.getFullYear(),
    mm: DATE_NOW.getMonth()
  };

  setupProperties_(yyyy_mm);
  setupSettings_(yyyy_mm);
  setupTables_();
  setupMonthSheet_();
  setupUnique_();
  setupBackstage_();
  setupSummary_();
  setupTags_();
  setupCards_();
  setupCashFlow_();
  setupWest_();
  setupEast_(yyyy_mm);
}
