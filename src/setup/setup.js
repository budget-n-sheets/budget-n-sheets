function isInstalled_ () {
  let isInstalled = CacheService2.get('document', 'is_installed', 'boolean');

  if (isInstalled == null) {
    isInstalled = PropertiesService2.getProperty('document', 'is_installed', 'string');
    isInstalled = (!!isInstalled);
    CacheService2.put('document', 'is_installed', 'boolean', isInstalled);
  }

  return isInstalled;
}

function uninstall_ (putLock) {
  deleteAllTriggers_();

  CacheService2.removeAll('document', CACHE_KEYS);

  if (putLock) {
    PropertiesService.getDocumentProperties().setProperties({ lock_spreadsheet: 'true' }, true);
    console.log('uninstall-with-lock');
  } else {
    PropertiesService.getDocumentProperties().deleteAllProperties();
    console.log('uninstall');
  }
}

function setupLock (select, param1, param2) {
  const lock = LockService.getDocumentLock();
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

  console.time('setup/' + select);
  setupValidate_();

  const settings = {};
  const list_accounts = [];

  if (select === 'new') {
    for (const key in param1) {
      settings[key] = param1[key];
    }

    settings.spreadsheet_name = settings.spreadsheet_name.trim();
    if (settings.spreadsheet_name === '') throw new Error('Invalid spreadsheet name.');

    for (let i = 0; i < param2.length; i++) {
      list_accounts[i] = param2[i].trim();
      if (list_accounts[i] === '') throw new Error('Invalid account name.');
    }
  } else if (select === 'restore') {
    const candidate = PropertiesService2.getProperty('document', 'settings_candidate', 'json');
    if (candidate.file_id !== param1) throw new Error('File ID does not match.');

    const blob = DriveApp.getFileById(param1).getBlob();
    const data = blob.getDataAsString();
    const contentType = blob.getContentType();

    if (contentType === 'text/plain' || /:[0-9a-fA-F]+$/.test(data)) {
      const parts = data.split(':');

      const sha = computeDigest('SHA_1', parts[0], 'UTF_8');
      if (sha !== parts[1]) throw new Error("Hashes don't match.");

      settings.backup = parts[0];
    } else if (contentType === 'application/octet-stream') {
      const address = computeDigest(
        'SHA_1',
        param1 + SpreadsheetApp2.getActiveSpreadsheet().getId(),
        'UTF_8');
      const passphrase = CacheService2.get('user', address, 'string');
      CacheService2.remove('user', address, 'string');

      if (passphrase == null) {
        showSessionExpired();
        return;
      }

      const decrypted = decryptBackup_(passphrase, data);
      if (decrypted == null) throw new Error('decryptBackup_(): Decryption failed.');

      settings.backup = decrypted;
    }

    for (const key in candidate) {
      settings[key] = candidate[key];
    }

    settings.spreadsheet_name = candidate.spreadsheet_title;

    for (let i = 0; i < candidate.list_acc.length; i++) {
      list_accounts[i] = candidate.list_acc[i];
    }
  } else if (select === 'copy') {
    const candidate = PropertiesService2.getProperty('document', 'settings_candidate', 'json');
    if (candidate.file_id !== param1) throw new Error('File ID does not match.');

    for (const key in candidate) {
      settings[key] = candidate[key];
    }

    settings.spreadsheet_name = candidate.spreadsheet_title;
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
  PropertiesService2.setProperty('document', 'class_version2', 'json', class_version2);

  if (bsSignSetup_()) throw new Error('Failed to sign document.');

  try {
    setupTriggers_();
  } catch (err) {
    ConsoleLog.error(err);
  }

  spreadsheet.setActiveSheet(spreadsheet.getSheetByName('Summary'));
  PropertiesService2.setProperty('document', 'is_installed', 'boolean', true);

  showDialogSetupEnd();
  onOpen();

  SETUP_SETTINGS = null;
  console.timeEnd('setup/' + select);
}

function setupValidate_ () {
  if (!isTemplateAvailable()) throw new Error('Template is not available.');
  if (isInstalled_()) throw new Error('Add-on is already installed.');
  if (PropertiesService2.getProperty('document', 'lock_spreadsheet', 'boolean')) throw new Error('Spreadsheet is locked.');

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

  PropertiesService2.deleteAllProperties('document');
  deleteAllTriggers_();
  CacheService2.removeAll('document', CACHE_KEYS);

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
}
