const PATCH_THIS = Object.freeze({
  patch_list: [
    [
      null, [], [], [], [], [], [], [], [], [],
      [], [], [], [], [], [], [], [], [], [],
      [], [], [], [], [], [], [], [], [], [],
      [], [], [], [], [], [], [], [], [], [],
      [update_v0m40p0_, update_v0m40p1_],
      [null, null, null, update_v0m41p3_, null],
      [null, null, null, null, null, null, null, null, null, null, update_v0m42p10_, patchV0m42p11_, null, null, null, patchV0m42p15_, null, patchV0m42p17_, null, patchV0m42p19_]
    ]
  ],
  beta_list: []
});

function onlineUpdate_ () {
  const v0 = isScriptUpToDate_();
  if (v0 === 1) {
    return;
  } else if (v0 === 2) {
    showDialogErrorMessage();
    return 1;
  }

  const ui = SpreadsheetApp2.getUi();

  if (!AppsScript.isTemplateAvailable()) {
    ui.alert(
      'New version available',
      'Please, re-open the spreadsheet to update the add-on.',
      ui.ButtonSet.OK);
    return 1;
  }

  if (!User2.isAdmin()) {
    ui.alert(
      'Add-on update',
      'Please, contact the spreadsheet admin to update the add-on.',
      ui.ButtonSet.OK);
    return;
  }

  const spreadsheet_locale = SettingsSpreadsheet.getValueOf('spreadsheet_locale');
  if (spreadsheet_locale !== SpreadsheetApp2.getActiveSpreadsheet().getSpreadsheetLocale()) {
    updateDecimalSeparator_();
  }

  showDialogMessage('Add-on update', 'Updating add-on...', 1);

  const r = update_();

  if (r === 0) {
    ui.alert(
      'Update successful',
      'The update process is complete!',
      ui.ButtonSet.OK);
    return;
  } else if (r === 1) {
    ui.alert(
      "Can't update",
      'The add-on is busy. Try again in a moment.',
      ui.ButtonSet.OK);
  } else if (r === 2) {
    ui.alert(
      'Update failed',
      'Something went wrong. Please, try again later.',
      ui.ButtonSet.OK);
  } else if (r > 2) {
    AppsScript.uninstall();
    onOpen();
    showDialogErrorMessage();
  }

  return 1;
}

function seamlessUpdate_ () {
  if (!AppsScript.isTemplateAvailable()) return 1;
  if (!User2.isAdmin()) return 1;

  const spreadsheet_locale = SettingsSpreadsheet.getValueOf('spreadsheet_locale');
  if (spreadsheet_locale !== SpreadsheetApp2.getActiveSpreadsheet().getSpreadsheetLocale()) {
    updateDecimalSeparator_();
  }

  const v0 = isScriptUpToDate_();
  if (v0 === 1) return;
  if (v0 === 2) return 1;

  const r = update_();

  if (r === 0) return;
  if (r > 2) AppsScript.uninstall();

  return 1;
}

function isScriptUpToDate_ () {
  const v0 = getClassVersion_('script');
  const v1 = APPS_SCRIPT_GLOBAL.script_version;

  if (v0 === 1) return 2;

  if (v0.major > v1.major) return 1;
  if (v0.major === v1.major) {
    if (v0.minor > v1.minor) return 1;
    if (v0.minor === v1.minor) {
      if (v0.patch > v1.patch) return 1;
      if (v0.patch === v1.patch) {
        if (PATCH_THIS.beta_list.length === 0 || v0.beta >= PATCH_THIS.beta_list.length) return 1;
      }
    }
  }

  return 0;
}

function getClassVersion_ (property) {
  if (property !== 'script' && property !== 'template') {
    console.warn("getClassVersion_(): Invalid 'property' value.", { property: property });
    return 1;
  }

  const class_version2 = CachedAccess.get('class_version2');
  return class_version2[property];
}

function setClassVersion_ (property, value) {
  if (property !== 'script' && property !== 'template') {
    console.warn("setClassVersion_(): Invalid 'property' value.", { property: property });
    return 1;
  }

  const lock = LockService.getDocumentLock();
  try {
    lock.waitLock(200);
  } catch (err) {
    console.warn(err);
    return 1;
  }

  const class_version2 = PropertiesService3.document().getProperty('class_version2');
  if (!class_version2) {
    console.warn("setClassVersion_(): Invalid 'class_version2' value.");
    return 1;
  }

  class_version2[property] = value;

  CachedAccess.update('class_version2', class_version2);
  lock.releaseLock();
  return 0;
}

/**
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 *
 * 0.0.0
 *
function patchV0m0p0_ () {
  try {
  } catch (err) {
    console.error(err);
    return 2;
  }
} */

/**
 * Flush changes.
 *
 * 0.42.19
 */
function patchV0m42p19_ () {
  try {
    new AccountsService().flush();
    new CardsService().flush();
  } catch (err) {
    console.error(err);
    return 2;
  }
}

/**
 * Migrate tables db structure.
 *
 * 0.42.17
 */
function patchV0m42p17_ () {
  try {
    const db_tables = PropertiesService3.document().getProperty('DB_TABLES');
    let db;

    const db_accounts = {};
    db = db_tables.accounts.data;
    for (let i = 0; i < db.length; i++) {
      const id = db[i].id;

      db_accounts[id] = Utils.deepCopy(db[i]);

      db_accounts[id].index = i;
      db_accounts[id].time_start = db_accounts[id].time_a;

      delete db_accounts[id].id;
      delete db_accounts[id].time_a;
      delete db_accounts[id].time_z;
    }
    CachedAccess.update('db_accounts', db_accounts);

    const db_cards = {};
    db = db_tables.cards.data;
    for (let i = 0; i < db.length; i++) {
      const id = db[i].id;

      db_cards[id] = Utils.deepCopy(db[i]);

      db_cards[id].index = i;
      delete db_cards[id].id;
    }
    CachedAccess.update('db_cards', db_cards);

    PropertiesService3.document().deleteProperty('DB_TABLES');
   } catch (err) {
    console.error(err);
    return 2;
  }
}

/**
 * Test existence of property 'DB_TABLES'.
 * Refresh 'db_accounts' metadata.
 *
 * 0.42.15
 */
function patchV0m42p15_ () {
  try {
    if (PropertiesService.getDocumentProperties().getProperty('DB_TABLES') == null) return 3;

    SpreadsheetApp2.getActiveSpreadsheet()
      .createDeveloperMetadataFinder()
      .withVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
      .withKey('db_accounts')
      .find()
      .forEach(m => m.remove());

    new AccountsService().flush();
  } catch (err) {
    console.error(err);
    return 2;
  }
}

/**
 * Refresh Bs signature.
 *
 * 0.42.11
 */
function patchV0m42p11_ () {
  try {
    new BsAuth(SpreadsheetApp2.getActiveSpreadsheet()).update();
  } catch (err) {
    console.error(err);
    return 2;
  }
}

/**
 * Delete property 'spreadsheet_triggers'.
 *
 * 0.42.10
 */
function update_v0m42p10_ () {
  try {
    PropertiesService3.document().deleteProperty('spreadsheet_triggers');
  } catch (err) {
    console.error(err);
    return 2;
  }
}

/**
 * Fix initial month value in _Settings.
 *
 * 0.41.3
 */
function update_v0m41p3_ () {
  try {
    const initial_month = SettingsUser.getValueOf('initial_month');
    SettingsUser.setValueOf('initial_month', initial_month);
  } catch (err) {
    console.error(err);
    return 2;
  }
}

/**
 * Update formula of suggested description.
 *
 * 0.40.1
 */
function update_v0m40p1_ () {
  try {
    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
    const unique = spreadsheet.getSheetByName('_Unique');
    if (!unique) return;

    const cards = spreadsheet.getSheetByName('Cards');
    if (!cards) return;

    const max = cards.getMaxRows() - 5;
    if (max < 1) return;

    let range_cards = '';

    for (let i = 0; i < 12; i++) {
      range_cards += 'Cards!' + RangeUtils.rollA1Notation(6, 2 + 6 * i, max, 1) + '; ';
    }

    range_cards = '{' + range_cards.slice(0, -2) + '}';

    let formula = 'FILTER(' + range_cards + '; NOT(REGEXMATCH(' + range_cards + '; "[0-9]+/[0-9]+"))); ';
    formula += 'ARRAYFORMULA(REGEXREPLACE(FILTER(' + range_cards + '; REGEXMATCH(' + range_cards + '; "[0-9]+/[0-9]+")); "[0-9]+/[0-9]+"; ""))';
    formula = 'SORT(UNIQUE({' + formula + '})); ';
    formula += 'SORT(FILTER(' + range_cards + '; REGEXMATCH(' + range_cards + '; "[0-9]+/[0-9]+")))';
    formula = '{' + formula + '}';

    unique.getRange(1, 2).setFormula(formula);
  } catch (err) {
    console.error(err);
    return 2;
  }
}

/**
 * Setup suggested description.
 *
 * 0.40.0
 */
function update_v0m40p0_ () {
  try {
    let rr;

    rr = update_v0m40p0s0_();
    if (rr) return rr;

    rr = update_v0m40p0s1_();
    if (rr) return rr;

    rr = update_v0m40p0s2_();
    if (rr) return rr;
  } catch (err) {
    console.error(err);
    return 2;
  }
}

function update_v0m40p0s2_ () {
  try {
    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
    const unique = spreadsheet.getSheetByName('_Unique');
    if (!unique) return 1;

    const cards = spreadsheet.getSheetByName('Cards');
    if (!cards) return;

    const max = cards.getMaxRows() - 5;
    if (max < 1) return;

    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(unique.getRange('B:B'), false)
      .setAllowInvalid(true)
      .build();

    let range_cards = '';

    for (let i = 0; i < 12; i++) {
      cards.getRange(6, 2 + 6 * i, max, 1)
        .clearDataValidations()
        .setDataValidation(rule);

      range_cards += 'Cards!' + RangeUtils.rollA1Notation(6, 2 + 6 * i, max, 1) + '; ';
    }

    unique.getRange(1, 2).setFormula('SORT(UNIQUE({' + range_cards.slice(0, -2) + '}))');
  } catch (err) {
    console.error(err);
    return 2;
  }
}

function update_v0m40p0s1_ () {
  try {
    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
    const unique = spreadsheet.getSheetByName('_Unique');
    if (!unique) return 1;

    const num_acc = SettingsConst.getValueOf('number_accounts');
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(unique.getRange('A:A'), false)
      .setAllowInvalid(true)
      .build();

    let range_accounts = '';

    for (let i = 0; i < 12; i++) {
      const month = spreadsheet.getSheetByName(MONTH_NAME.short[i]);
      if (!month) continue;

      const max = month.getMaxRows() - 4;
      if (max < 1) continue;

      for (let k = 0; k <= num_acc; k++) {
        range_accounts += MONTH_NAME.short[i] + '!' + RangeUtils.rollA1Notation(5, 2 + 5 * k, max, 1) + '; ';

        month.getRange(5, 2 + 5 * k, max, 1)
          .clearDataValidations()
          .setDataValidation(rule);
      }
    }

    if (range_accounts === '') return;

    unique.getRange(1, 1).setFormula('SORT(UNIQUE({' + range_accounts.slice(0, -2) + '}))');
  } catch (err) {
    console.error(err);
    return 2;
  }
}

function update_v0m40p0s0_ () {
  try {
    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();

    let sheet = spreadsheet.getSheetByName('_Unique');
    if (sheet) spreadsheet.deleteSheet(sheet);

    const template = SpreadsheetApp.openById(APPS_SCRIPT_GLOBAL.template_id);

    sheet = template.getSheetByName('_Unique')
      .copyTo(spreadsheet)
      .setName('_Unique')
      .setTabColor('#cc0000');

    spreadsheet.setActiveSheet(sheet);
    spreadsheet.moveActiveSheet(spreadsheet.getNumSheets());

    sheet.protect().setWarningOnly(true);
    sheet.hideSheet();
  } catch (err) {
    console.error(err);
    return 2;
  }
}
