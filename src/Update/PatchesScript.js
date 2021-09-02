
/**
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 *
 * 0.0.0
 *
function patchV0m0p0_ () {
  return 0;
} */

/**
 * Move metadata location to spreadsheet.
 * Flush accounts and cards changes.
 *
 * 0.42.30
 */
function patchV0m42p30_ () {
  SpreadsheetApp2.getActiveSpreadsheet()
    .createDeveloperMetadataFinder()
    .withVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
    .find()
    .forEach(item => item.moveToSpreadsheet());

  new AccountsService().flush();
  new CardsService().flush();

  return 0;
}

/**
 * Resume activity to fix bad functions.
 *
 * 0.42.28
 */
function patchV0m42p28_ () {
  return switchActivity_('resume', 0, 11);
}

/**
 * Flush changes.
 *
 * 0.42.19 > 0.42.21
 */
function patchV0m42p21_ () {
  new AccountsService().flush();
  new CardsService().flush();

  return 0;
}

/**
 * Migrate tables db structure.
 *
 * 0.42.17
 */
function patchV0m42p17_ () {
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
  return 0;
}

/**
 * Test existence of property 'DB_TABLES'.
 * Refresh 'db_accounts' metadata.
 *
 * 0.42.15
 */
function patchV0m42p15_ () {
  if (PropertiesService.getDocumentProperties().getProperty('DB_TABLES') == null) return 3;

  SpreadsheetApp2.getActiveSpreadsheet()
    .createDeveloperMetadataFinder()
    .withVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
    .withKey('db_accounts')
    .find()
    .forEach(m => m.remove());

  new AccountsService().flush();

  return 0;
}

/**
 * Refresh Bs signature.
 *
 * 0.42.11
 */
function patchV0m42p11_ () {
  new BsAuth(SpreadsheetApp2.getActiveSpreadsheet()).update();

  return 0;
}

/**
 * Delete property 'spreadsheet_triggers'.
 *
 * 0.42.10
 */
function update_v0m42p10_ () {
  PropertiesService3.document().deleteProperty('spreadsheet_triggers');

  return 0;
}

/**
 * Fix initial month value in _Settings.
 *
 * 0.41.3
 */
function update_v0m41p3_ () {
  const initial_month = SettingsUser.getValueOf('initial_month');
  SettingsUser.setValueOf('initial_month', initial_month);

  return 0;
}

/**
 * Update formula of suggested description.
 *
 * 0.40.1
 */
function update_v0m40p1_ () {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  const unique = spreadsheet.getSheetByName('_Unique');
  if (!unique) return 0;

  const cards = spreadsheet.getSheetByName('Cards');
  if (!cards) return 0;

  const max = cards.getMaxRows() - 5;
  if (max < 1) return 0;

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

  return 0;
}

/**
 * Setup suggested description.
 *
 * 0.40.0
 */
function update_v0m40p0_ () {
  let r = 0;

  r = update_v0m40p0s0_();
  if (r !== 0) return r;

  r = update_v0m40p0s1_();
  if (r !== 0) return r;

  r = update_v0m40p0s2_();
  if (r !== 0) return r;

  return 0;
}

function update_v0m40p0s2_ () {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  const unique = spreadsheet.getSheetByName('_Unique');
  if (!unique) return 1;

  const cards = spreadsheet.getSheetByName('Cards');
  if (!cards) return 0;

  const max = cards.getMaxRows() - 5;
  if (max < 1) return 0;

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

  return 0;
}

function update_v0m40p0s1_ () {
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
    const month = spreadsheet.getSheetByName(Consts.month_name.short[i]);
    if (!month) continue;

    const max = month.getMaxRows() - 4;
    if (max < 1) continue;

    for (let k = 0; k <= num_acc; k++) {
      range_accounts += Consts.month_name.short[i] + '!' + RangeUtils.rollA1Notation(5, 2 + 5 * k, max, 1) + '; ';

      month.getRange(5, 2 + 5 * k, max, 1)
        .clearDataValidations()
        .setDataValidation(rule);
    }
  }

  if (range_accounts === '') return 0;

  unique.getRange(1, 1).setFormula('SORT(UNIQUE({' + range_accounts.slice(0, -2) + '}))');

  return 0;
}

function update_v0m40p0s0_ () {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();

  let sheet = spreadsheet.getSheetByName('_Unique');
  if (sheet) spreadsheet.deleteSheet(sheet);

  const template = SpreadsheetApp.openById(Info.template.id);

  sheet = template.getSheetByName('_Unique')
    .copyTo(spreadsheet)
    .setName('_Unique')
    .setTabColor('#cc0000');

  spreadsheet.setActiveSheet(sheet);
  spreadsheet.moveActiveSheet(spreadsheet.getNumSheets());

  sheet.protect().setWarningOnly(true);
  sheet.hideSheet();

  return 0;
}
