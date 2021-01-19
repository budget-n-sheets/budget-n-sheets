const PATCH_THIS = Object.freeze({
  patch_list: [
    [
      null, [], [], [], [], [], [], [], [], [],
      [], [], [], [], [], [], [], [], [], [],
      [], [], [], [], [], [], [], [], [], [],
      [null, null, null, null, null, null, update_v0m30p6_],
      [update_v0m31p0_, null, null, null, null, null, update_v0m31p6_, update_v0m31p7_, update_v0m31p8_, null],
      [null, null, update_v0m32p2_, null, null, null, update_v0m32p6_, update_v0m32p7_, null],
      [update_v0m33p0_, update_v0m33p1_, update_v0m33p2_, null, null, null, null, null, null, update_v0m33p9_],
      [update_v0m34p0_, null, null, null, null, null, null, update_v0m34p7_, null, null, update_v0m34p10_, null, null],
      [update_v0m35p0_, update_v0m35p1_, update_v0m35p2_, null, null, null, null],
      [null, null, update_v0m36p2_, update_v0m36p3_, update_v0m36p4_, null],
      [null, null, null, update_v0m37p3_, null, null, update_v0m37p6_, update_v0m37p7_, update_v0m37p8_, update_v0m37p9_, null, null, null, null, update_v0m37p14_, null, update_v0m37p16_, null, null, update_v0m37p19_, update_v0m37p20_]
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

  const ui = SpreadsheetApp.getUi();

  if (!isTemplateAvailable()) {
    ui.alert(
      'New version available',
      'Please, re-open the spreadsheet to update the add-on.',
      ui.ButtonSet.OK);
    return 1;
  }

  if (!isUserAdmin_()) {
    ui.alert(
      'Add-on update',
      'Please, contact the spreadsheet admin to update the add-on.',
      ui.ButtonSet.OK);
    return;
  }

  const spreadsheet_locale = getSpreadsheetSettings_('spreadsheet_locale');
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
    uninstall_();
    onOpen();
    showDialogErrorMessage();
  }

  return 1;
}

function seamlessUpdate_ () {
  if (!isTemplateAvailable()) return 1;
  if (!isUserAdmin_()) return 1;

  const spreadsheet_locale = getSpreadsheetSettings_('spreadsheet_locale');
  if (spreadsheet_locale !== SpreadsheetApp2.getActiveSpreadsheet().getSpreadsheetLocale()) {
    updateDecimalSeparator_();
  }

  const v0 = isScriptUpToDate_();
  if (v0 === 1) return;
  if (v0 === 2) return 1;

  const r = update_();

  if (r === 0) return;
  if (r > 2) uninstall_();

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
    ConsoleLog.warn("getClassVersion_(): Invalid 'property' value.", { property: property });
    return 1;
  }

  let class_version2 = CacheService2.get('document', 'class_version2', 'json');
  if (!class_version2) {
    class_version2 = PropertiesService2.getProperty('document', 'class_version2', 'json');
    if (!class_version2) {
      ConsoleLog.warn("getClassVersion_(): Invalid 'class_version2' value.");
      return 1;
    }

    CacheService2.put('document', 'class_version2', 'json', class_version2);
  }

  return class_version2[property];
}

function setClassVersion_ (property, value) {
  if (property !== 'script' && property !== 'template') {
    ConsoleLog.warn("setClassVersion_(): Invalid 'property' value.", { property: property });
    return 1;
  }

  const lock = LockService.getDocumentLock();
  try {
    lock.waitLock(200);
  } catch (err) {
    ConsoleLog.warn(err);
    return 1;
  }

  const class_version2 = PropertiesService2.getProperty('document', 'class_version2', 'json');
  if (!class_version2) {
    ConsoleLog.warn("setClassVersion_(): Invalid 'class_version2' value.");
    return 1;
  }

  class_version2[property] = value;

  PropertiesService2.setProperty('document', 'class_version2', 'json', class_version2);
  CacheService2.put('document', 'class_version2', 'json', class_version2);
  lock.releaseLock();
  return 0;
}

/**
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 *
 * 0.0.0
 *
function update_v0m0p0_ () {
  try {
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
} */

/**
 * Fix bad values in _Settings.
 *
 * 0.37.20
 */
function update_v0m37p20_ () {
  try {
    const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('_Settings');
    if (!sheet) return 1;

    const financial_year = getConstProperties_('financial_year');
    const initial_month = getUserSettings_('initial_month');
    const decimal_places = getSpreadsheetSettings_('decimal_places');

    sheet.getRange(2, 2).setFormula(FormatNumber.localeSignal(financial_year));
    sheet.getRange(4, 2).setFormula(FormatNumber.localeSignal(initial_month + 1));
    sheet.getRange(9, 2).setFormula(FormatNumber.localeSignal(decimal_places));
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

/**
 * Fix missing reference to cards BSBLANK().
 * Update BSBLANK formulas.
 *
 * 0.37.19
 */
function update_v0m37p19_ () {
  try {
    const h_ = TABLE_DIMENSION.height;
    const w_ = TABLE_DIMENSION.width;

    const formulasBuild = FormulaBuild.backstage();
    const formulasWallet = formulasBuild.wallet();
    const formulasAcc = formulasBuild.accounts();
    const formulasCards = formulasBuild.cards();

    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
    const backstage = spreadsheet.getSheetByName('_Backstage');
    if (!backstage) return 1;

    const num_acc = getConstProperties_('number_accounts');
    const col = 2 + w_ + w_ * num_acc + w_;

    for (let mm = 0; mm < 12; mm++) {
      const sheet = spreadsheet.getSheetByName(MONTH_NAME.short[mm]);
      if (!sheet) continue;

      const numRows = sheet.getMaxRows() - 4;
      if (numRows < 1) continue;

      const formula = formulasWallet.bsblank(mm, rollA1Notation(5, 3, numRows));
      backstage.getRange(2 + h_ * mm, 6).setFormula(formula);

      for (let k = 0; k < num_acc; k++) {
        const header_value = rollA1Notation(4, 8 + 5 * k);

        const formula = formulasAcc.bsblank(mm, header_value, rollA1Notation(5, 8 + 5 * k, numRows));
        backstage.getRange(2 + h_ * mm, 11 + w_ * k).setFormula(formula);
      }
    }

    const cards = spreadsheet.getSheetByName('Cards');
    if (!cards) return 1;

    const numRows = cards.getMaxRows() - 5;
    if (numRows < 1) return 1;

    for (let mm = 0; mm < 12; mm++) {
      const formula = formulasCards.bsblank(numRows, mm);
      backstage.getRange(2 + h_ * mm, 4 + col - w_).setFormula(formula);

      const ref = rollA1Notation(2 + h_ * mm, 4 + col - w_);
      for (let k = 0; k < 10; k++) {
        backstage.getRange(2 + h_ * mm, 4 + col + w_ * k).setFormula(ref);
      }
    }
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

/**
 * Update decimal separator.
 * Reinstall triggers.
 * Update table headers formula.
 * Append new info to _Settings tab.
 * Update Summary content.
 *
 * 0.37.16
 */
function update_v0m37p16_ () {
  try {
    updateDecimalSeparator_();
    reinstallTriggers_();

    let rr;

    rr = update_v0m37p16s0_();
    if (rr) return rr;

    rr = update_v0m37p16s1_();
    if (rr) return rr;

    rr = update_v0m37p16s2_();
    if (rr) return rr;
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

function update_v0m37p16s2_ () {
  try {
    const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('Summary');
    if (!sheet) return;

    sheet.insertRowsAfter(48, 2);
    sheet.setRowHeights(50, 2, 21);
    sheet.autoResizeRows(50, 2);

    sheet.getRange(50, 2)
      .setFontSize(19)
      .setFontStyle('italic')
      .setValue('Stats for Tags');
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

function update_v0m37p16s1_ () {
  try {
    const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('_Settings');
    if (!sheet) return 1;

    sheet.getRange(9, 1, 3, 1)
      .setValues([
        ['Decimal places'],
        ['Decimal separator'],
        ['Number format']
      ])
      .setNumberFormats([
        ['0'], ['0'], ['@']
      ]);
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

function update_v0m37p16s0_ () {
  try {
    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();

    const h_ = TABLE_DIMENSION.height;
    const w_ = TABLE_DIMENSION.width;

    const num_acc = getConstProperties_('number_accounts');
    const col = 2 + w_ + w_ * num_acc;

    const buildMonth = FormulaBuild.ttt().header();
    for (let i = 0; i < 12; i++) {
      const sheet = spreadsheet.getSheetByName(MONTH_NAME.short[i]);
      if (!sheet) continue;

      for (let k = 0; k < num_acc; k++) {
        const formula = buildMonth.report(k, i);
        sheet.getRange(1, 8 + 5 * k).setFormula(formula);
      }
    }

    const sheetCards = spreadsheet.getSheetByName('Cards');
    if (!sheetCards) return;

    const buildCards = FormulaBuild.cards().header();
    for (let i = 0; i < 12; i++) {
      const head = rollA1Notation(2, 1 + 6 * i);
      const cell = '_Backstage!' + rollA1Notation(2 + h_ * i, col);

      let formula;

      formula = buildCards.avail_credit(i, cell);
      sheetCards.getRange(3, 1 + 6 * i).setFormula(formula);

      formula = buildCards.report(head, cell);
      sheetCards.getRange(2, 4 + 6 * i).setFormula(formula);
    }
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

/**
 * Removes whitespace from both ends of a string.
 *
 * 0.37.14
 */
function update_v0m37p14_ () {
  try {
    const db_accounts = getDbTables_('accounts');

    for (let i = 0; i < db_accounts.ids.length; i++) {
      let trimmed = db_accounts.names[i].trim();

      if (db_accounts.names[i] !== trimmed) {
        if (trimmed === '') trimmed = 'Account ' + (1 + i);
        db_accounts.data[i].name = trimmed;
        tablesService('set', 'account', db_accounts.data[i]);
      }
    }

    const db_cards = getDbTables_('cards');

    for (let i = 0; i < db_cards.codes.length; i++) {
      let code = db_cards.codes[i].trim();
      let name = db_cards.data[i].name.trim();

      if (db_cards.codes[i] !== code || db_cards.data[i].name !== name) {
        if (code === '') code = 'CARD00' + (1 + i);
        if (name === '') name = 'Card 00' + (1 + i);

        db_cards.data[i].name = name;
        db_cards.data[i].code = code;
        db_cards.data[i].aliases = db_cards.data[i].aliases.join(',');

        tablesService('set', 'setcard', db_cards.data[i]);
      }
    }
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

/**
 * Fix Summary chart data formula.
 * Fix formula of Tags.
 *
 * 0.37.9
 */
function update_v0m37p9_ () {
  try {
    let rr;

    rr = update_v0m37p9s0_();
    if (rr) return rr;

    rr = update_v0m37p9s1_();
    if (rr) return rr;
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

function update_v0m37p9s1_ () {
  try {
    const buildFormula = FormulaBuild.tags().table();

    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
    const sheetTags = spreadsheet.getSheetByName('Tags');
    if (!sheetTags) return 1;

    const formulas = [[]];

    let numRowsMonth, numRowsCards;

    const sheetCards = spreadsheet.getSheetByName('Cards');
    if (!sheetCards) numRowsCards = -1;
    else {
      numRowsCards = sheetCards.getMaxRows() - 5;
      if (numRowsCards < 1) numRowsCards = -1;
    }

    for (let mm = 0; mm < 12; mm++) {
      const sheet = spreadsheet.getSheetByName(MONTH_NAME.short[mm]);
      let numRowsMonth;

      if (!sheet) numRowsMonth = -1;
      else {
        numRowsMonth = sheet.getMaxRows() - 4;
        if (numRowsMonth < 1) numRowsMonth = -1;
      }

      formulas[0][mm] = buildFormula.month(numRowsMonth, numRowsCards, mm);
    }

    sheetTags.getRange(1, 6, 1, 12).setFormulas(formulas);
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

function update_v0m37p9s0_ () {
  try {
    const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('Summary');
    if (!sheet) return 1;

    const formula = FormulaBuild.summary().chart3().data(0).replace(/""/g, '0');
    sheet.getRange('I73').setFormula(formula);
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

/**
 * Fix array separator in 'BSCARDPART()' formula.
 * Rebuild Summary charts.
 * Reinstall 'timeBased' trigger.
 * Treat layout.
 *
 * 0.37.8
 */
function update_v0m37p8_ () {
  try {
    let rr;

    rr = update_v0m37p8s0_();
    if (rr) return rr;

    rr = update_v0m37p8s1_();
    if (rr) return rr;

    const financial_year = getConstProperties_('financial_year');
    const yyyy = DATE_NOW.getFullYear();

    if (financial_year === yyyy) treatLayout_(yyyy, DATE_NOW.getMonth());

    if (financial_year > yyyy) {
      stopTrigger_('timeBased');
      Utilities.sleep(200);
      startTrigger_('timeBased');
    }
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

function update_v0m37p8s1_ () {
  try {
    const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('Summary');
    if (!sheet) return 1;

    const formula = FormulaBuild.summary().chart3().data(0).replace(/""/g, '0');
    sheet.getRange('I73').setFormula(formula);

    const charts = sheet.getCharts();
    for (let i = 0; i < charts.length; i++) {
      sheet.removeChart(charts[i]);
    }

    options = {
      0: { color: '#b7b7b7', type: 'bars', labelInLegend: 'Income' },
      1: { color: '#cccccc', type: 'bars', labelInLegend: 'Expenses' },
      2: { color: '#45818e', type: 'bars', labelInLegend: 'Income' },
      3: { color: '#e69138', type: 'bars', labelInLegend: 'Expenses' },
      4: { color: '#45818e', type: 'line', labelInLegend: 'Avg Income' },
      5: { color: '#e69138', type: 'line', labelInLegend: 'Avg Expenses' }
    };

    chart = sheet.newChart()
      .addRange(sheet.getRange('C25:I36'))
      .setChartType(Charts.ChartType.COMBO)
      .setPosition(24, 2, 0, 0)
      .setOption('mode', 'view')
      .setOption('legend', 'top')
      .setOption('focusTarget', 'category')
      .setOption('series', options)
      .setOption('height', 482)
      .setOption('width', 886)
      .build();
    sheet.insertChart(chart);

    chart = sheet.newChart()
      .addRange(sheet.getRange('B52:B62'))
      .addRange(sheet.getRange('D52:D62'))
      .setNumHeaders(1)
      .setChartType(Charts.ChartType.PIE)
      .setPosition(50, 8, 0, 0)
      .setOption('mode', 'view')
      .setOption('legend', 'top')
      .setOption('focusTarget', 'category')
      .setOption('height', 447)
      .setOption('width', 444)
      .build();
    sheet.insertChart(chart);

    options = {
      0: { color: '#b7b7b7', type: 'bars', labelInLegend: 'Total' },
      1: { color: '#45818e', type: 'bars', labelInLegend: 'Total' },
      2: { color: '#45818e', type: 'line', labelInLegend: 'Average' }
    };

    chart = sheet.newChart()
      .addRange(sheet.getRange('B73:B84'))
      .addRange(sheet.getRange('I73:K84'))
      .setChartType(Charts.ChartType.COMBO)
      .setPosition(70, 8, 0, 0)
      .setOption('mode', 'view')
      .setOption('legend', 'top')
      .setOption('focusTarget', 'category')
      .setOption('series', options)
      .setOption('height', 459)
      .setOption('width', 444)
      .build();
    sheet.insertChart(chart);
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

function update_v0m37p8s0_ () {
  try {
    const h_ = TABLE_DIMENSION.height;
    const w_ = TABLE_DIMENSION.width;

    const formulaBuild = FormulaBuild.backstage().cards();

    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
    const sheetCards = spreadsheet.getSheetByName('Cards');
    if (!sheetCards) return 1;

    const numRows = sheetCards.getMaxRows() - 5;
    if (numRows < 1) return 1;

    const sheet = spreadsheet.getSheetByName('_Backstage');
    if (!sheet) return 1;

    const number_accounts = getConstProperties_('number_accounts');
    const column = 2 + w_ + w_ * number_accounts + w_;

    for (let k = 0; k < 10; k++) {
      const regex = rollA1Notation(1, column + w_ * k);

      for (let mm = 0; mm < 12; mm++) {
        const bsblank = rollA1Notation(2 + h_ * mm, column + 4 + w_ * k);
        const formula = formulaBuild.bscardpart(numRows, mm, regex, bsblank);

        sheet.getRange(5 + h_ * mm, 1 + column + w_ * k).setFormula(formula);
      }
    }
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

/**
 * Fix 'BSBLANK()' range reference.
 *
 * 0.37.7
 */
function update_v0m37p7_ () {
  try {
    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
    let sheet;

    sheet = spreadsheet.getSheetByName('Cards');
    if (!sheet) return;

    const max = sheet.getMaxRows() - 5;
    if (max < 1) return;

    sheet = spreadsheet.getSheetByName('_Backstage');
    if (!sheet) return;

    const number_accounts = getConstProperties_('number_accounts');

    const h_ = TABLE_DIMENSION.height;
    const w_ = TABLE_DIMENSION.width;

    const col = 2 + w_ + w_ * number_accounts + 4;

    for (let i = 0; i < 12; i++) {
      sheet.getRange(2 + h_ * i, col).setFormula('BSBLANK(TRANSPOSE(Cards!' + rollA1Notation(6, 4 + 6 * i, max, 1) + '))');
    }
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

/**
 * Set missing reference to cards total expenses.
 * Update sheet 'Summary'.
 *
 * 0.37.6
 */
function update_v0m37p6_ () {
  try {
    update_v0m37p6s0_();

    const rr = update_v0m37p6s1_();
    if (rr) return rr;
  } catch (err) {
    ConsoleLog.error(err);
  }
}

function update_v0m37p6s1_ () {
  try {
    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
    let sheet;

    sheet = spreadsheet.getSheetByName('Summary');
    if (sheet) spreadsheet.deleteSheet(sheet);

    const template = SpreadsheetApp.openById(APPS_SCRIPT_GLOBAL.template_id);
    sheet = template.getSheetByName('Summary')
      .copyTo(spreadsheet)
      .setName('Summary');

    sheet.setTabColor('#e69138');
    spreadsheet.setActiveSheet(sheet);
    spreadsheet.moveActiveSheet(1);

    SETUP_SETTINGS = {
      financial_year: getConstProperties_('financial_year'),
      decimal_places: getSpreadsheetSettings_('decimal_places'),
      number_format: '#,##0.00;(#,##0.00)'
    };

    const dec_p = SETUP_SETTINGS.decimal_places;
    const dec_c = (dec_p > 0 ? '.' + '0'.repeat(dec_p) : '');
    SETUP_SETTINGS.number_format = '#,##0' + dec_c + ';' + '(#,##0' + dec_c + ')';

    setupSummary_();
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

function update_v0m37p6s0_ () {
  try {
    const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('_Backstage');
    if (!sheet) return;

    const num_acc = getConstProperties_('number_accounts');
    const card_total = ['B6', 'B7', 'B16', 'B17', 'B26', 'B27', 'B36', 'B37', 'B46', 'B47', 'B56', 'B57', 'B66', 'B67', 'B76', 'B77', 'B86', 'B87', 'B96', 'B97', 'B106', 'B107', 'B116', 'B117'];

    const w_ = TABLE_DIMENSION.width;

    SpreadsheetApp.flush();
    sheet.getRangeList(card_total).setFormulaR1C1('R[-2]C[' + (w_ + w_ * num_acc) + ']');
    SpreadsheetApp.flush();
  } catch (err) {
    ConsoleLog.error(err);
  }
}

/**
 * Delete property 'settings_candidate'.
 * Update decimal separator.
 * Update 'BSCARDPART()' function based on decimal separator settings.
 *
 * 0.37.3
 */
function update_v0m37p3_ () {
  try {
    PropertiesService2.deleteProperty('document', 'settings_candidate');

    updateDecimalSeparator_();

    const decimal_separator = getSpreadsheetSettings_('decimal_separator');
    if (decimal_separator) return;

    const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('_Backstage');
    if (!sheet) return;

    const number_accounts = getConstProperties_('number_accounts');
    const h_ = TABLE_DIMENSION.height;
    const w_ = TABLE_DIMENSION.width;

    const col = 2 + w_ + w_ * number_accounts + w_;
    const max2 = 400;

    let mm = -1;
    while (++mm < 12) {
      const range1A1 = rollA1Notation(6, 4 + 6 * mm, max2);
      const range2A1 = rollA1Notation(6, 3 + 6 * mm, max2);

      for (let k = 0; k < 10; k++) {
        const header2 = rollA1Notation(2 + h_ * mm, 4 + col + w_ * k);

        let formula = 'REGEXEXTRACT(ARRAY_CONSTRAIN(Cards!' + rollA1Notation(6, 2 + 6 * mm, max2) + '; ' + header2 + '; 1); "[0-9]+/[0-9]+")';
        formula = 'ARRAYFORMULA(SPLIT(' + formula + '; "/"))';
        formula = '{' + formula + '\\ ARRAY_CONSTRAIN(Cards!' + range1A1 + '; ' + header2 + '; 1)}; ';
        formula = formula + 'REGEXMATCH(ARRAY_CONSTRAIN(Cards!' + range2A1 + '; ' + header2 + '; 1); ' + rollA1Notation(1, col + w_ * k) + '); ';

        formula = formula + 'NOT(ISBLANK(ARRAY_CONSTRAIN(Cards!' + range1A1 + '; ' + header2 + '; 1))); ';
        formula = formula + 'REGEXMATCH(ARRAY_CONSTRAIN(Cards!' + rollA1Notation(6, 2 + 6 * mm, max2) + '; ' + header2 + '; 1); "[0-9]+/[0-9]+")';

        formula = 'BSCARDPART(TRANSPOSE(IFNA(FILTER(' + formula + '); 0)))';
        formula = 'IF(' + rollA1Notation(1, col + w_ * k) + ' = ""; 0; ' + formula + ')';

        sheet.getRange(5 + h_ * mm, 1 + col + w_ * k).setFormula(formula);
      }
    }
  } catch (err) {
    ConsoleLog.error(err);
  }
}

/**
 * Set spreadsheet and settings metadata.
 * Set number format of random value.
 *
 * 0.36.4
 */
function update_v0m36p4_ () {
  try {
    let rr;

    rr = update_v0m36p4s0_();
    if (rr) return rr;

    rr = update_v0m36p4s1_();
    if (rr) return rr;

    rr = update_v0m36p4s2_();
    if (rr) return rr;

    const user_settings = PropertiesService2.getProperty('document', 'user_settings', 'json');
    updateSettingsMetadata_(user_settings);

    updateDecimalSeparator_();
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

function update_v0m36p4s2_ () {
  try {
    const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('_Backstage');
    if (!sheet) return 1;

    const db = getTablesService_('all');
    let metadata, list;

    metadata = [];
    for (let k = 0; k < db.accounts.length; k++) {
      metadata[k] = {};
      Object.assign(metadata[k], db.accounts[k]);
      delete metadata[k].id;
    }

    list = sheet.createDeveloperMetadataFinder()
      .withVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
      .withKey('db_accounts')
      .find();

    if (list.length > 0) {
      list[0].setValue(JSON.stringify(metadata));
    } else {
      sheet.addDeveloperMetadata(
        'db_accounts',
        JSON.stringify(metadata),
        SpreadsheetApp.DeveloperMetadataVisibility.PROJECT
      );
    }

    metadata = [];
    for (let k = 0; k < db.cards.length; k++) {
      metadata[k] = {};
      Object.assign(metadata[k], db.cards[k]);
      delete metadata[k].id;
    }

    list = sheet.createDeveloperMetadataFinder()
      .withVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
      .withKey('db_cards')
      .find();

    if (list.length > 0) {
      list[0].setValue(JSON.stringify(metadata));
    } else {
      sheet.addDeveloperMetadata(
        'db_cards',
        JSON.stringify(metadata),
        SpreadsheetApp.DeveloperMetadataVisibility.PROJECT
      );
    }
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

function update_v0m36p4s1_ () {
  try {
    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
    const list = spreadsheet.createDeveloperMetadataFinder()
      .withVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
      .withKey('const_properties')
      .find();

    for (let i = 0; i < list.length; i++) {
      list[i].remove();
    }

    const const_properties = PropertiesService2.getProperty('document', 'const_properties', 'json');
    delete const_properties.date_created;

    spreadsheet.addDeveloperMetadata(
      'const_properties',
      JSON.stringify(const_properties),
      SpreadsheetApp.DeveloperMetadataVisibility.PROJECT
    );
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

function update_v0m36p4s0_ () {
  try {
    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
    const list = spreadsheet.createDeveloperMetadataFinder()
      .withVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
      .withKey('bs_sig')
      .find();

    for (let i = 0; i < list.length; i++) {
      list[i].remove();
    }
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

/**
 * Set recalculation interval to 'ON_CHANGE'.
 * Copy legacy properties of triggers ID to 'spreadsheet_triggers' structure.
 * Delete legacy properties of triggers ID.
 *
 * 0.36.3
 */
function update_v0m36p3_ () {
  try {
    SpreadsheetApp2.getActiveSpreadsheet()
      .setRecalculationInterval(SpreadsheetApp.RecalculationInterval.ON_CHANGE);

    let onOpen = PropertiesService2.getProperty('document', 'onOpenTriggerId', 'string');
    let onEdit = PropertiesService2.getProperty('document', 'onEditTriggerId', 'string');
    let clock = PropertiesService2.getProperty('document', 'clockTriggerId', 'string');

    if (!onOpen) onOpen = '';
    if (!onEdit) onEdit = '';
    if (!clock) clock = '';

    const properties = {
      owner: getAdminSettings_('admin_id'),
      onOpen: { id: onOpen, time_created: 0 },
      onEdit: { id: onEdit, time_created: 0 },
      timeBased: { id: clock, time_created: 0 }
    };

    PropertiesService2.setProperty('document', 'spreadsheet_triggers', 'json', properties);

    PropertiesService2.deleteProperty('document', 'onOpenTriggerId');
    PropertiesService2.deleteProperty('document', 'onEditTriggerId');
    PropertiesService2.deleteProperty('document', 'clockTriggerId');
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

/**
 * Set property 'spreadsheet_triggers'.
 *
 * 0.36.2
 */
function update_v0m36p2_ () {
  try {
    const properties = {
      owner: getAdminSettings_('admin_id'),
      onOpen: { id: '', time_created: 0 },
      onEdit: { id: '', time_created: 0 },
      timeBased: { id: '', time_created: 0 }
    };
    PropertiesService2.setProperty('document', 'spreadsheet_triggers', 'json', properties);
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

/**
 * Fix cleared range reference for averages.
 *
 * 0.35.2
 */
function update_v0m35p2_ () {
  try {
    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Summary');
    if (!sheet) return;

    sheet.getRange(25, 8, 12, 1).setFormula('=$D$10');
    sheet.getRange(25, 9, 12, 1).setFormula('=-$F$10');
  } catch (err) {
    ConsoleLog.error(err);
  }
}

/**
 * Fix symbol separator in arrays.
 * Clear content for function expansion.
 *
 * 0.35.1
 */
function update_v0m35p1_ () {
  try {
    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Summary');
    if (!sheet) return;

    let i;

    const dec_c = (getSpreadsheetSettings_('decimal_separator') ? ',' : ' \\');

    const list = [];
    const formulas = [];

    sheet.getRange(25, 5, 12, 5).clearContent();

    for (i = 0; i < 12; i++) {
      list[i] = rollA1Notation(11 + i, 8);

      formulas[i] = [
        'IF(OR(ROW() - 24 < $M$3; ROW() - 24 > $M$3 - 1 + $M$4); {' + rollA1Notation(11 + i, 4) + dec_c + ' -' + rollA1Notation(11 + i, 6) + dec_c + ' ""' + dec_c + ' ""}; {""' + dec_c + ' ""' + dec_c + ' ' + rollA1Notation(11 + i, 4) + dec_c + ' -' + rollA1Notation(11 + i, 6) + '})'
      ];
    }
    sheet.getRange(25, 4, 12, 1).setFormulas(formulas);

    sheet.getRange(25, 4).setFormula('IF(OR(ROW() - 24 < $M$3; ROW() - 24 > $M$3 - 1 + $M$4); {' + rollA1Notation(11, 4) + dec_c + ' -' + rollA1Notation(11, 6) + dec_c + ' 0' + dec_c + ' 0}; {0' + dec_c + ' 0' + dec_c + ' ' + rollA1Notation(11, 4) + dec_c + ' -' + rollA1Notation(11, 6) + '})');
  } catch (err) {
    ConsoleLog.error(err);
  }
}

/**
 * Add 'decimal_places' to spreadsheet settings.
 * Update accounts header format.
 * Update Summary chart.
 *
 * 0.35.0
 */
function update_v0m35p0_ () {
  try {
    setSpreadsheetSettings_('decimal_places', 2);

    update_v0m35p0s0_();
    update_v0m35p0s1_();
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

function update_v0m35p0s1_ () {
  try {
    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Summary');
    let i;

    if (!sheet) return;

    const h_ = TABLE_DIMENSION.height;

    sheet.getRange(2, 13, 3, 1).setFormulas([
      ['_Settings!B3'],
      ['_Settings!B4'],
      ['_Settings!B6']
    ]);

    sheet.getRange(2, 13).copyTo(
      sheet.getRange(4, 13),
      { formatOnly: true }
    );

    // const list = [];
    // const formulas = [];
    //
    // for (i = 0; i < 12; i++) {
    //   list[i] = rollA1Notation(11 + i, 8);
    //
    //   formulas[i] = [
    //     'IF(OR(ROW() - 24 < $M$3; ROW() - 24 > $M$3 - 1 + $M$4); {' + rollA1Notation(11 + i, 4) + ', -' + rollA1Notation(11 + i, 6) + ', "", ""}; {"", "", ' + rollA1Notation(11 + i, 4) + ', -' + rollA1Notation(11 + i, 6) + '})'
    //   ];
    // }
    // sheet.getRange(25, 4, 12, 1).setFormulas(formulas);

    sheet.getRange(25, 8, 12, 1).setFormula('=$D$10');
    sheet.getRange(25, 9, 12, 1).setFormula('=-$F$10');

    // sheet.getRange(25, 4).setFormula('IF(OR(ROW() - 24 < $M$3; ROW() - 24 > $M$3 - 1 + $M$4); {' + rollA1Notation(11, 4) + ', -' + rollA1Notation(11, 6) + ', 0, 0}; {0, 0, ' + rollA1Notation(11, 4) + ', -' + rollA1Notation(11, 6) + '})');

    sheet.getRange(9, 4, 1, 5).setFormulas([[
      '=IF(_Settings!$B6 > 0;  {SUM(OFFSET($D10; _Settings!$B4; 0; _Settings!$B6; 1)); AVERAGE(OFFSET($D10; _Settings!$B4; 0; _Settings!$B6; 1))}; {0; 0})', null,
      '=IF(_Settings!$B6 > 0;  {SUM(OFFSET($F10; _Settings!$B4; 0; _Settings!$B6; 1)); AVERAGE(OFFSET($F10; _Settings!$B4; 0; _Settings!$B6; 1))}; {0; 0})', null,
      '=D9 + F9'
    ]]);

    const charts = sheet.getCharts();
    if (charts[0]) sheet.removeChart(charts[0]);

    const options = {
      0: { color: '#b7b7b7', type: 'bars', labelInLegend: 'Income' },
      1: { color: '#cccccc', type: 'bars', labelInLegend: 'Expenses' },
      2: { color: '#45818e', type: 'bars', labelInLegend: 'Income' },
      3: { color: '#e69138', type: 'bars', labelInLegend: 'Expenses' },
      4: { color: '#45818e', type: 'line', labelInLegend: 'Avg Income' },
      5: { color: '#e69138', type: 'line', labelInLegend: 'Avg Expenses' }
    };

    const chart = sheet.newChart()
      .addRange(sheet.getRange('C25:I36'))
      .setChartType(Charts.ChartType.COMBO)
      .setPosition(24, 2, 0, 0)
      .setOption('mode', 'view')
      .setOption('legend', 'top')
      .setOption('focusTarget', 'category')
      .setOption('series', options)
      .setOption('height', 482)
      .setOption('width', 886);

    sheet.insertChart(chart.build());
  } catch (err) {
    ConsoleLog.error(err);
  }
}

function update_v0m35p0s0_ () {
  try {
    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
    let sheet;
    let expr1, expr2, expr3, expr4;

    const h_ = TABLE_DIMENSION.height;
    const w_ = TABLE_DIMENSION.width;

    const num_acc = getConstProperties_('number_accounts');

    for (let i = 0; i < 12; i++) {
      sheet = spreadsheet.getSheetByName(MONTH_NAME.short[i]);
      if (!sheet) continue;

      for (k = 0; k < num_acc; k++) {
        expr1 = 'TEXT(_Backstage!' + rollA1Notation(2 + h_ * i, 8 + w_ * k) + '; "#,##0.00;-#,##0.00")';
        expr1 = '"Withdrawal: ["; _Backstage!' + rollA1Notation(2 + h_ * i, 9 + w_ * k) + '; "] "; ' + expr1 + '; "\n"; ';

        expr2 = 'TEXT(_Backstage!' + rollA1Notation(3 + h_ * i, 8 + w_ * k) + '; "#,##0.00;-#,##0.00")';
        expr2 = '"Deposit: ["; _Backstage!' + rollA1Notation(3 + h_ * i, 9 + w_ * k) + '; "] "; ' + expr2 + '; "\n"; ';

        expr3 = 'TEXT(_Backstage!' + rollA1Notation(4 + h_ * i, 8 + w_ * k) + '; "#,##0.00;-#,##0.00")';
        expr3 = '"Trf. in: ["; _Backstage!' + rollA1Notation(4 + h_ * i, 9 + w_ * k) + '; "] "; ' + expr3 + '; "\n"; ';

        expr4 = 'TEXT(_Backstage!' + rollA1Notation(5 + h_ * i, 8 + w_ * k) + '; "#,##0.00;-#,##0.00")';
        expr4 = '"Trf. out: ["; _Backstage!' + rollA1Notation(5 + h_ * i, 9 + w_ * k) + '; "] "; ' + expr4;

        sheet.getRange(1, 8 + 5 * k).setFormula('CONCATENATE(' + expr1 + expr2 + expr3 + expr4 + ')');
      }
    }
  } catch (err) {
    ConsoleLog.error(err);
  }
}

/**
 * Set recalculation interval to 'ON_CHANGE'.
 *
 * 0.34.10
 */
function update_v0m34p10_ () {
  try {
    SpreadsheetApp2.getActiveSpreadsheet().setRecalculationInterval(SpreadsheetApp.RecalculationInterval.ON_CHANGE);
  } catch (err) {
    ConsoleLog.error(err);
  }
}

/**
 * Set spreadsheet settings 'optimize_load'.
 *
 * 0.34.7
 */
function update_v0m34p7_ () {
  try {
    const status = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    setSpreadsheetSettings_('optimize_load', status);
  } catch (err) {
    ConsoleLog.error(err);
  }
}

/**
 * Set 'optimize_load' initial value to 'false'.
 *
 * 0.34.0
 */
function update_v0m34p0_ () {
  try {
    setUserSettings_('optimize_load', false);
  } catch (err) {
    ConsoleLog.error(err);
  }
}

/**
 * Fix all accounts balance range referencing.
 *
 * 0.33.9
 */
function update_v0m33p9_ () {
  try {
    const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('_Backstage');
    if (!sheet) return 1;

    const h_ = TABLE_DIMENSION.height;
    const w_ = TABLE_DIMENSION.width;

    const db_accounts = getDbTables_('accounts');
    let account, list, col, i, k;

    for (k = 0; k < db_accounts.data.length; k++) {
      account = db_accounts.data[k];
      col = 2 + w_ + w_ * k;
      list = [];

      for (i = 1; i < 12; i++) {
        list[i - 1] = rollA1Notation(2 + h_ * i, col);
      }

      sheet.getRange(2, col).setFormula('0');
      sheet.getRangeList(list).setFormulaR1C1('R[-' + (h_ - 1) + ']C');
      sheet.getRange(2 + h_ * account.time_a, col).setFormula('=' + FormatNumber.localeSignal(account.balance));
    }
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

/**
 * Set spreadsheet settings 'view_mode'.
 *
 * 0.33.2
 */
function update_v0m33p2_ () {
  try {
    setSpreadsheetSettings_('view_mode', 'complete');
    viewModeComplete_();
  } catch (err) {
    ConsoleLog.error(err);
  }
}

/**
 * Remove conditional formmating from tag code column.
 * Set data validation in tag code column.
 *
 * 0.33.1
 */
function update_v0m33p1_ () {
  try {
    const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('Tags');
    let rule;
    if (!sheet) return;

    const maxRows = sheet.getMaxRows() - 1;
    if (maxRows < 1) return;

    rule = SpreadsheetApp.newDataValidation()
      .requireFormulaSatisfied('=REGEXMATCH($E2; "^\\w+$")')
      .setHelpText('Accepted charset: 0-9, a-z, A-Z, _')
      .setAllowInvalid(true)
      .build();
    sheet.getRange(2, 5, maxRows, 1).clearDataValidations().setDataValidation(rule);

    sheet.clearConditionalFormatRules();
    const rules = sheet.getConditionalFormatRules();

    range = sheet.getRange(2, 6, maxRows, 12);
    rule = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=COLUMN() - 5 < INDIRECT("_Settings!B4")')
      .setFontColor('#cccccc')
      .setRanges([range])
      .build();
    rules.push(rule);

    range = sheet.getRange(2, 6, maxRows, 12);
    rule = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=COLUMN() - 5 > INDIRECT("_Settings!B4") - 1 + INDIRECT("_Settings!B6")')
      .setFontColor('#999999')
      .setRanges([range])
      .build();
    rules.push(rule);

    sheet.setConditionalFormatRules(rules);
  } catch (err) {
    ConsoleLog.error(err);
  }
}

/**
 * Update functions with 'ARRAY_CONSTRAIN'.
 * Add conditional formatting.
 * Format table of tags.
 * Update functions of Average and Total.
 *
 * 0.33.0
 */
function update_v0m33p0_ () {
  try {
    let rr;
    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
    let i;

    const limits = [];
    const sheets = [];

    for (i = 0; i < 12; i++) {
      sheets[i] = spreadsheet.getSheetByName(MONTH_NAME.short[i]);
      if (sheets[i]) limits[i] = sheets[i].getMaxRows();
      else limits[i] = 0;
    }

    rr = update_v0m33p0s0_(spreadsheet, limits);
    if (rr) return rr;
    rr = update_v0m33p0s1_(spreadsheet, limits);
    if (rr) return rr;
    rr = update_v0m33p0s2_(spreadsheet, limits);
    if (rr) return rr;

    update_v0m33p0s3_(spreadsheet);
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

function update_v0m33p0s3_ (spreadsheet) {
  try {
    const sheet = spreadsheet.getSheetByName('Tags');
    let formula;
    if (!sheet) return;

    const n = sheet.getMaxRows() - 1;
    if (n < 1) return;

    const rules = sheet.getConditionalFormatRules();

    const range = sheet.getRange(2, 5, n, 1);
    const rule = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=REGEXMATCH($E2; "^\\w+$") = FALSE')
      .setFontColor('#cccccc')
      .setRanges([range])
      .build();

    rules.push(rule);
    sheet.setConditionalFormatRules(rules);

    formula = 'ARRAYFORMULA(IF(E2:E <> ""; $T$2:$T/_Settings!B6; ))';
    formula = 'IF(_Settings!$B$6 > 0; ' + formula + '; ARRAYFORMULA($F$2:$F * 0))';
    formula = 'IF(_Settings!$B$7 > 0; ' + formula + '; "")';
    formula = '{"average"; ' + formula + '}';
    sheet.getRange(1, 19).setFormula(formula);

    formula = 'IF(COLUMN(' + rollA1Notation(2, 6, n, 12) + ') - 5 < _Settings!$B$4 + _Settings!$B$6; ROW(' + rollA1Notation(2, 6, n) + '); 0)';
    formula = 'IF(COLUMN(' + rollA1Notation(2, 6, n, 12) + ') - 5 >= _Settings!$B$4; ' + formula + '; 0)';
    formula = 'ARRAYFORMULA(IF(E2:E <> ""; SUMIF(' + formula + '; ROW(' + rollA1Notation(2, 6, n) + '); ' + rollA1Notation(2, 6, n) + '); ))';
    formula = 'IF(_Settings!$B$6 > 0; ' + formula + '; ARRAYFORMULA($F$2:$F * 0))';
    formula = 'IF(_Settings!$B$7 > 0; ' + formula + '; "")';
    formula = '{"total"; ' + formula + '}';
    sheet.getRange(1, 20).setFormula(formula);

    formatTags_();
  } catch (err) {
    ConsoleLog.error(err);
  }
}

function update_v0m33p0s2_ (spreadsheet, limits) {
  try {
    let sheet, formula;
    let header, header2;
    let limit, i, k;

    sheet = spreadsheet.getSheetByName('Cards');
    if (!sheet) return;
    limit = sheet.getMaxRows();
    if (limit < 7) return;
    limit -= 5;

    sheet = spreadsheet.getSheetByName('_Backstage');
    if (!sheet) return 1;

    const h_ = TABLE_DIMENSION.height;
    const w_ = TABLE_DIMENSION.width;

    const dec_p = getSpreadsheetSettings_('decimal_separator');
    const num_acc = getConstProperties_('number_accounts');

    const dec_c = (dec_p ? ',' : '\\');
    const col = 2 + w_ + w_ * num_acc + w_;

    const range2 = [];
    const range3 = [];
    const range4 = [];
    const range5 = [];

    for (i = 0; i < 12; i++) {
      range2[i] = rollA1Notation(6, 2 + 6 * i, limit);
      range3[i] = rollA1Notation(6, 3 + 6 * i, limit);
      range4[i] = rollA1Notation(6, 4 + 6 * i, limit);
      range5[i] = rollA1Notation(6, 5 + 6 * i, limit);
    }

    for (k = 0; k < 10; k++) {
      header = rollA1Notation(1, col + w_ * k);

      for (i = 0; i < 12; i++) {
        header2 = rollA1Notation(2 + h_ * i, col + 4 + w_ * k);

        formula = 'IFERROR(IF(' + header + ' = ""; ""; SUM(FILTER(';
        formula += 'ARRAY_CONSTRAIN(Cards!' + range4[i] + '; ' + header2 + '; 1); ';
        formula += 'REGEXMATCH(ARRAY_CONSTRAIN(Cards!' + range3[i] + '; ' + header2 + '; 1); ' + header + '); ';
        formula += 'NOT(ISBLANK(ARRAY_CONSTRAIN(Cards!' + range4[i] + '; ' + header2 + '; 1))); ';
        formula += 'ARRAY_CONSTRAIN(Cards!' + range4[i] + '; ' + header2 + '; 1) >= 0';
        formula += '))); 0)';
        sheet.getRange(3 + h_ * i, col + w_ * k).setFormula(formula);

        formula = 'IFERROR(IF(' + header + ' = ""; ""; SUM(FILTER(';
        formula += 'ARRAY_CONSTRAIN(Cards!' + range4[i] + '; ' + header2 + '; 1); ';
        formula += 'REGEXMATCH(ARRAY_CONSTRAIN(Cards!' + range3[i] + '; ' + header2 + '; 1); ' + header + '); ';
        formula += 'NOT(ISBLANK(ARRAY_CONSTRAIN(Cards!' + range4[i] + '; ' + header2 + '; 1))); ';
        formula += 'ARRAY_CONSTRAIN(Cards!' + range4[i] + '; ' + header2 + '; 1) < 0; ';
        formula += 'NOT(REGEXMATCH(ARRAY_CONSTRAIN(Cards!' + range5[i] + '; ' + header2 + '; 1); ';
        formula += '"#ign"))';
        formula += '))); 0)';
        sheet.getRange(4 + h_ * i, col + w_ * k).setFormula(formula);

        formula = 'IFERROR(IF(' + header + ' = ""; ""; SUM(FILTER(';
        formula += 'ARRAY_CONSTRAIN(Cards!' + range4[i] + '; ' + header2 + '; 1); ';
        formula += 'REGEXMATCH(ARRAY_CONSTRAIN(Cards!' + range3[i] + '; ' + header2 + '; 1); ' + header + '); ';
        formula += 'NOT(ISBLANK(ARRAY_CONSTRAIN(Cards!' + range4[i] + '; ' + header2 + '; 1))); ';
        formula += 'ARRAY_CONSTRAIN(Cards!' + range4[i] + '; ' + header2 + '; 1) < 0';
        formula += '))); 0)';
        sheet.getRange(5 + h_ * i, col + w_ * k).setFormula(formula);

        formula = 'REGEXEXTRACT(ARRAY_CONSTRAIN(Cards!' + range2[i] + '; ' + header2 + '; 1); "[0-9]+/[0-9]+")';
        formula = 'ARRAYFORMULA(SPLIT(' + formula + '; "/"))';
        formula = '{' + formula + dec_c + ' ARRAY_CONSTRAIN(Cards!' + range4[i] + '; ' + header2 + '; 1)}; ';
        formula = formula + 'REGEXMATCH(ARRAY_CONSTRAIN(Cards!' + range3[i] + '; ' + header2 + '; 1); ' + rollA1Notation(1, col + w_ * k) + '); ';

        formula = formula + 'NOT(ISBLANK(ARRAY_CONSTRAIN(Cards!' + range4[i] + '; ' + header2 + '; 1))); ';
        formula = formula + 'REGEXMATCH(ARRAY_CONSTRAIN(Cards!' + range2[i] + '; ' + header2 + '; 1); "[0-9]+/[0-9]+")';

        formula = 'BSCARDPART(TRANSPOSE(IFNA(FILTER(' + formula + '); 0)))';
        formula = 'IF(' + rollA1Notation(1, col + w_ * k) + ' = ""; 0; ' + formula + ')';

        sheet.getRange(5 + h_ * i, 1 + col + w_ * k).setFormula(formula);
      }
    }

    SpreadsheetApp.flush();
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

function update_v0m33p0s1_ (spreadsheet, limits) {
  try {
    let sheet, formula, rg, cd;
    let i, k;

    sheet = spreadsheet.getSheetByName('Cards');
    if (!sheet) return;
    const limit = sheet.getMaxRows();

    sheet = spreadsheet.getSheetByName('Tags');
    if (!sheet) return;

    const h_ = TABLE_DIMENSION.height;
    const w_ = TABLE_DIMENSION.width;

    const num_acc = getConstProperties_('number_accounts');

    const col = 11 + w_ * num_acc;

    const tags = ['I5:I', 'N5:N', 'S5:S', 'X5:X', 'AC5:AC'];
    const combo = ['H5:I', 'M5:N', 'R5:S', 'W5:X', 'AB5:AC'];

    i = -1;
    while (++i < 12) {
      if (limits[i] < 6) continue;

      rg = '{ARRAY_CONSTRAIN(' + MONTH_NAME.short[i] + '!C5:D' + limits[i] + '; _Backstage!' + rollA1Notation(2 + h_ * i, 6) + '; 2)';
      cd = '{ARRAY_CONSTRAIN(' + MONTH_NAME.short[i] + '!D5:D' + limits[i] + '; _Backstage!' + rollA1Notation(2 + h_ * i, 6) + '; 1)';

      for (k = 0; k < num_acc; k++) {
        rg += '; ARRAY_CONSTRAIN(' + MONTH_NAME.short[i] + '!' + combo[k] + limits[i] + '; _Backstage!' + rollA1Notation(2 + h_ * i, 6 + w_ * k) + '; 2)';
        cd += '; ARRAY_CONSTRAIN(' + MONTH_NAME.short[i] + '!' + tags[k] + limits[i] + '; _Backstage!' + rollA1Notation(2 + h_ * i, 6 + w_ * k) + '; 1)';
      }

      if (limit > 6) {
        rg += '; ARRAY_CONSTRAIN(Cards!' + rollA1Notation(6, 4 + 6 * i, limit - 5, 2) + '; _Backstage!' + rollA1Notation(2 + h_ * i, col) + '; 2)}';
        cd += '; ARRAY_CONSTRAIN(Cards!' + rollA1Notation(6, 5 + 6 * i, limit - 5, 1) + '; _Backstage!' + rollA1Notation(2 + h_ * i, col) + ' ; 1)}';
      } else {
        rg += '}';
        cd += '}';
      }

      formula = 'IFERROR(FILTER(' + rg + '; NOT(ISBLANK(' + cd + '))); "")';
      formula = 'BSSUMBYTAG(TRANSPOSE($E$1:$E); ' + formula + ')';
      formula = '{"' + MONTH_NAME.long[i] + '"; IF(_Settings!$B$7 > 0; ' + formula + '; )}';

      sheet.getRange(1, 6 + i).setFormula(formula);
    }

    SpreadsheetApp.flush();
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

function update_v0m33p0s0_ (spreadsheet, limits) {
  try {
    const sheet = spreadsheet.getSheetByName('_Backstage');
    let i, k;

    if (!sheet) return 1;

    const h_ = TABLE_DIMENSION.height;
    const w_ = TABLE_DIMENSION.width;

    const num_acc = getConstProperties_('number_accounts');
    const dec_p = getSpreadsheetSettings_('decimal_separator');

    const col = 2 + w_ + w_ * num_acc + w_;
    const dec_c = (dec_p ? ',' : '\\');

    const values = ['H5:H', 'M5:M', 'R5:R', 'W5:W', 'AB5:AB'];
    const tags = ['I5:I', 'N5:N', 'S5:S', 'X5:X', 'AC5:AC'];
    const combo = ['H5:I', 'M5:N', 'R5:S', 'W5:X', 'AB5:AC'];
    const balance1 = ['G2', 'L2', 'Q2', 'V2', 'AA2', 'G12', 'L12', 'Q12', 'V12', 'AA12', 'G22', 'L22', 'Q22', 'V22', 'AA22', 'G32', 'L32', 'Q32', 'V32', 'AA32', 'G42', 'L42', 'Q42', 'V42', 'AA42', 'G52', 'L52', 'Q52', 'V52', 'AA52', 'G62', 'L62', 'Q62', 'V62', 'AA62', 'G72', 'L72', 'Q72', 'V72', 'AA72', 'G82', 'L82', 'Q82', 'V82', 'AA82', 'G92', 'L92', 'Q92', 'V92', 'AA92', 'G102', 'L102', 'Q102', 'V102', 'AA102', 'G112', 'L112', 'Q112', 'V112', 'AA112'];

    i = -1;
    while (++i < 12) {
      if (limits[i] < 6) continue;

      formula = 'NOT(REGEXMATCH(ARRAY_CONSTRAIN(' + MONTH_NAME.short[i] + '!D5:D' + limits[i] + '; ' + rollA1Notation(2 + h_ * i, 6) + '; 1); "#ign"))';
      formula = 'NOT(ISBLANK(ARRAY_CONSTRAIN(' + MONTH_NAME.short[i] + '!C5:C' + limits[i] + '; ' + rollA1Notation(2 + h_ * i, 6) + '; 1))); ' + formula;
      formula = 'FILTER(ARRAY_CONSTRAIN(' + MONTH_NAME.short[i] + '!C5:C' + limits[i] + '; ' + rollA1Notation(2 + h_ * i, 6) + '; 1); ' + formula + ')';
      formula = 'SUM(IFERROR(' + formula + '; 0))';
      sheet.getRange(4 + h_ * i, 2).setFormula(formula);

      for (k = 0; k < num_acc; k++) {
        formula = 'NOT(ISBLANK(ARRAY_CONSTRAIN(' + MONTH_NAME.short[i] + '!' + values[k] + limits[i] + '; ' + rollA1Notation(2 + h_ * i, 11 + w_ * k) + '; 1)))';
        formula = 'FILTER(ARRAY_CONSTRAIN(' + MONTH_NAME.short[i] + '!' + values[k] + limits[i] + '; ' + rollA1Notation(2 + h_ * i, 11 + w_ * k) + '; 1); ' + formula + ')';
        formula = balance1[5 * i + k] + ' + IFERROR(SUM(' + formula + '); 0)';
        sheet.getRange(3 + h_ * i, 7 + w_ * k).setFormula(formula);

        formula = 'NOT(REGEXMATCH(ARRAY_CONSTRAIN(' + MONTH_NAME.short[i] + '!' + tags[k] + limits[i] + '; ' + rollA1Notation(2 + h_ * i, 11 + w_ * k) + '; 1); "#(dp|wd|qcc|ign|rct|trf)"))';
        formula = 'NOT(ISBLANK(ARRAY_CONSTRAIN(' + MONTH_NAME.short[i] + '!' + values[k] + limits[i] + '; ' + rollA1Notation(2 + h_ * i, 11 + w_ * k) + '; 1))); ' + formula;
        formula = 'FILTER(ARRAY_CONSTRAIN(' + MONTH_NAME.short[i] + '!' + values[k] + limits[i] + '; ' + rollA1Notation(2 + h_ * i, 11 + w_ * k) + '; 1); ' + formula + ')';
        formula = 'IFERROR(SUM(' + formula + '); 0)';
        sheet.getRange(4 + h_ * i, 7 + w_ * k).setFormula(formula);

        formula = 'NOT(ISBLANK(ARRAY_CONSTRAIN(' + MONTH_NAME.short[i] + '!' + tags[k] + limits[i] + '; ' + rollA1Notation(2 + h_ * i, 11 + w_ * k) + '; 1)))';
        formula = 'IFERROR(FILTER(ARRAY_CONSTRAIN(' + MONTH_NAME.short[i] + '!' + combo[k] + limits[i] + '; ' + rollA1Notation(2 + h_ * i, 11 + w_ * k) + '; 2); ' + formula + '); "")';
        formula = 'BSREPORT(TRANSPOSE(' + formula + '))';
        sheet.getRange(2 + h_ * i, 8 + w_ * k).setFormula(formula);
      }
    }

    SpreadsheetApp.flush();
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

/**
 * Add BSBLANK() to _Backstage.
 *
 * 0.32.7
 */
function update_v0m32p7_ () {
  try {
    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
    const backstage = spreadsheet.getSheetByName('_Backstage');
    let n, i, k;

    if (!backstage) return;

    const h_ = TABLE_DIMENSION.height;
    const w_ = TABLE_DIMENSION.width;

    const height = 120;
    const num_acc = getConstProperties_('number_accounts');

    const wallet = new Array(height);
    const cards = new Array(height);

    const accounts = [];
    for (k = 0; k < num_acc; k++) {
      accounts[k] = new Array(height);
    }

    n = height;
    while (n--) {
      wallet[n] = [null];
      cards[n] = [null];

      for (k = 0; k < num_acc; k++) {
        accounts[k][n] = [null];
      }
    }

    for (i = 0; i < 12; i++) {
      sheet = spreadsheet.getSheetByName(MONTH_NAME.short[i]);
      if (!sheet) continue;
      n = sheet.getMaxRows() - 4;
      if (n < 1) continue;

      wallet[h_ * i] = ['BSBLANK(TRANSPOSE(' + MONTH_NAME.short[i] + '!' + rollA1Notation(5, 3, n, 1) + '))'];
      for (k = 0; k < num_acc; k++) {
        accounts[k][h_ * i] = ['BSBLANK(TRANSPOSE(' + MONTH_NAME.short[i] + '!' + rollA1Notation(5, 8 + 5 * k, n, 1) + '))'];
      }
    }

    backstage.getRange(2, 6, height, 1).setFormulas(wallet);
    for (k = 0; k < num_acc; k++) {
      backstage.getRange(2, 11 + w_ * k, height, 1).setFormulas(accounts[k]);
    }

    sheet = spreadsheet.getSheetByName('Cards');
    if (!sheet) return;
    n = sheet.getMaxRows() - 5;
    if (n < 1) return;

    for (i = 0; i < 12; i++) {
      cards[h_ * i] = ['BSBLANK(TRANSPOSE(Cards!' + rollA1Notation(6, 4 + 6 * i, n, 1) + '))'];
    }
    backstage.getRange(2, 6 + w_ * num_acc + w_, height, 1).setFormulas(cards);

    const col = 16 + w_ * num_acc;
    for (k = 0; k < 10; k++) {
      list = [];
      for (i = 0; i < 12; i++) {
        list[i] = rollA1Notation(2 + h_ * i, col + w_ * k);
      }
      backstage.getRangeList(list).setFormulaR1C1('RC[-' + (w_ + w_ * k) + ']');
    }
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

/**
 * Reinstall trigger with new schedules.
 *
 * 0.32.6
 */
function update_v0m32p6_ () {
  try {
    const triggers = ScriptApp.getUserTriggers(SpreadsheetApp2.getActiveSpreadsheet());

    for (let i = 0; i < triggers.length; i++) {
      if (triggers[i].getEventType() === ScriptApp.EventType.CLOCK) {
        ScriptApp.deleteTrigger(triggers[i]);
      }
    }

    const yyyy = DATE_NOW.getFullYear();
    let trigger, day;

    const hour = 2 + randomInteger(4);
    const financial_year = getConstProperties_('financial_year');

    if (financial_year < yyyy) {
      day = 1 + randomInteger(28);
      trigger = createNewTrigger_('weeklyTriggerPos_', 'onMonthDay', { days: day, hour: hour });
      saveTriggerId_(trigger, 'document', 'clockTriggerId');
    } else if (financial_year === yyyy) {
      trigger = createNewTrigger_('dailyTrigger_', 'everyDays', { days: 1, hour: hour });
      saveTriggerId_(trigger, 'document', 'clockTriggerId');
    } else if (financial_year > yyyy) {
      day = new Date(financial_year, 0, 2).getDay();
      trigger = createNewTrigger_('weeklyTriggerPre_', 'onWeekDay', { weeks: 1, week: day, hour: hour });
      saveTriggerId_(trigger, 'document', 'clockTriggerId');
    }
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

/**
 * Import new Quick Actions sheet.
 * Update Tags table header.
 *
 * 0.32.2
 */
function update_v0m32p2_ () {
  try {
    update_v0m32p2s0_();

    const rr = update_v0m32p2s1_();
    if (rr) return rr;
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

function update_v0m32p2s1_ () {
  try {
    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
    let sheet;

    sheet = spreadsheet.getSheetByName('Quick Actions');
    if (!sheet) return;

    const template = SpreadsheetApp.openById(APPS_SCRIPT_GLOBAL.template_id);

    const tmp = spreadsheet.insertSheet();

    const n = sheet.getIndex();
    spreadsheet.deleteSheet(sheet);

    sheet = template.getSheetByName('Quick Actions')
      .copyTo(spreadsheet)
      .setName('Quick Actions');

    sheet.setTabColor('#6aa84f');

    const ranges = [];
    ranges[0] = sheet.getRange(3, 3, 3, 1);
    ranges[1] = sheet.getRange(8, 3, 2, 1);
    ranges[2] = sheet.getRange(12, 2, 1, 2);

    sheet.protect()
      .setUnprotectedRanges(ranges)
      .setWarningOnly(true);

    spreadsheet.setActiveSheet(sheet);
    spreadsheet.moveActiveSheet(n);

    spreadsheet.deleteSheet(tmp);
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

function update_v0m32p2s0_ () {
  try {
    const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('Tags');
    if (!sheet) return;

    sheet.getRange(1, 1, 1, 5).setValues([
      ['name', 'category', 'description', 'analytics', 'code']
    ]);
  } catch (err) {
    ConsoleLog.error(err);
  }
}

/**
 * Fix range of card limit.
 *
 * 0.31.8
 */
function update_v0m31p8_ () {
  try {
    const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('_Backstage');
    let card, ranges, text, i, j;

    const h_ = TABLE_DIMENSION.height;
    const w_ = TABLE_DIMENSION.width;

    const db_cards = getDbTables_('cards');
    const num_acc = getConstProperties_('number_accounts');
    const col = 2 + w_ + w_ * num_acc + w_ + 1;

    if (!sheet) return;

    for (i = 0; i < db_cards.count; i++) {
      card = db_cards.data[i];

      ranges = [];
      for (j = 0; j < 12; j++) {
        ranges[j] = rollA1Notation(2 + h_ * j, col + w_ * i);
      }

      limit = '=' + FormatNumber.localeSignal(card.limit);
      text = '^' + card.code + '$';
      for (j = 0; j < card.aliases.length; j++) {
        text += '|^' + card.aliases[j] + '$';
      }

      sheet.getRange(1, col + w_ * i - 1).setValue(text);
      sheet.getRangeList(ranges).setValue(limit);
    }
  } catch (err) {
    ConsoleLog.error(err);
  }
}

/**
 * Update formula of wallet expenses.
 *
 * 0.31.7
 */
function update_v0m31p7_ () {
  try {
    const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('_Backstage');
    let formula, i;

    if (!sheet) return;

    const h_ = TABLE_DIMENSION.height;

    for (i = 0; i < 12; i++) {
      formula = 'NOT(REGEXMATCH(' + MONTH_NAME.short[i] + '!D5:D404; "#ign"))';
      formula = 'NOT(ISBLANK(' + MONTH_NAME.short[i] + '!C5:C404)); ' + formula;
      formula = 'FILTER(' + MONTH_NAME.short[i] + '!C5:C404; ' + formula + ')';
      formula = 'SUM(IFNA(' + formula + '; 0))';

      sheet.getRange(4 + h_ * i, 2).setFormula(formula);
    }
  } catch (err) {
    ConsoleLog.error(err);
  }
}

/**
 * Convert 'is_installed' value '[ ]' to 'true'.
 *
 * 0.31.6
 */
function update_v0m31p6_ () {
  try {
    const documentProperties = PropertiesService.getDocumentProperties();

    if (documentProperties.getProperty('is_installed') !== 'true') documentProperties.setProperty('is_installed', 'true');
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

/**
 * Define 'admin_id'.
 * Set 'admin_settings'.
 *
 * 0.31.0
 */
function update_v0m31p0_ () {
  try {
    const cp = PropertiesService2.getProperty('document', 'const_properties', 'json');

    let admin;

    if (cp.addon_user) admin = cp.addon_user;
    else admin = setUserId_();

    properties = {
      admin_id: admin,
      isChangeableByEditors: false
    };
    PropertiesService2.setProperty('document', 'admin_settings', 'json', properties);
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

/**
 * Refresh 'user_id'.
 * Reinstall clock triggers.
 *
 * 0.30.6
 */
function update_v0m30p6_ () {
  try {
    setUserId_();

    const handlers = ['onOpenInstallable_', 'onEditInstallable_', 'dailyTrigger_', 'weeklyTriggerPos_', 'weeklyTriggerPre_'];
    const financial_year = getConstProperties_('financial_year');

    let trigger, yyyy, dd, name;
    let eventType, installClock, installOnEdit;

    installClock = false;
    installOnEdit = false;
    const triggers = ScriptApp.getUserTriggers(SpreadsheetApp2.getActiveSpreadsheet());

    for (let i = 0; i < triggers.length; i++) {
      name = triggers[i].getHandlerFunction();
      if (handlers.indexOf(name) !== -1) continue;

      eventType = triggers[i].getEventType();
      ScriptApp.deleteTrigger(triggers[i]);

      switch (eventType) {
        case ScriptApp.EventType.CLOCK:
          installClock = true;
          break;
        case ScriptApp.EventType.ON_EDIT:
          installOnEdit = true;
          break;

        default:
          console.info('update_v0m30p6_(): Switch case is default.', eventType);
          break;
      }
    }

    if (installOnEdit) {
      trigger = createNewTrigger_('onEditInstallable_', 'onEdit');
      saveTriggerId_(trigger, 'document', 'onEditTriggerId');
    }

    if (installClock) {
      yyyy = DATE_NOW.getFullYear();
      if (financial_year < yyyy) {
        trigger = createNewTrigger_('weeklyTriggerPos_', 'onWeekDay', { weeks: 1, week: 2 });
        saveTriggerId_(trigger, 'document', 'clockTriggerId');
      } else if (financial_year === yyyy) {
        trigger = createNewTrigger_('dailyTrigger_', 'everyDays', { days: 1, hour: 2 });
        saveTriggerId_(trigger, 'document', 'clockTriggerId');
      } else if (financial_year > yyyy) {
        dd = new Date(financial_year, 0, 2).getDay();
        trigger = createNewTrigger_('weeklyTriggerPre_', 'onWeekDay', { weeks: 1, week: dd });
        saveTriggerId_(trigger, 'document', 'clockTriggerId');
      }
    }

    PropertiesService2.deleteProperty('document', 'onEditMainId');
    PropertiesService2.deleteProperty('document', 'dailyMainId');
    PropertiesService2.deleteProperty('document', 'weeklyMainId');
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}
