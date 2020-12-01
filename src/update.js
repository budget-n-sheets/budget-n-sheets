var PATCH_THIS = Object.freeze({
  patch_list: [
    [
      null, [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ],
      [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ],
      [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ],
      [ null, null, null, null, null, null, update_v0m30p6_ ],
      [ update_v0m31p0_, null, null, null, null, null, update_v0m31p6_, update_v0m31p7_, update_v0m31p8_, null ],
      [ null, null, update_v0m32p2_, null, null, null, update_v0m32p6_, update_v0m32p7_, null ],
      [ update_v0m33p0_, update_v0m33p1_, update_v0m33p2_, null, null, null, null, null, null, update_v0m33p9_ ],
      [ update_v0m34p0_, null, null, null, null, null, null, update_v0m34p7_, null, null, update_v0m34p10_, null, null ],
      [ update_v0m35p0_, update_v0m35p1_, update_v0m35p2_, null, null, null ]
    ]
  ],
  beta_list: [ ]
});


function onlineUpdate_() {
	const v0 = isScriptUpToDate_();
  if (v0 === 1) {
    return;
  } else if (v0 === 2) {
    showDialogErrorMessage();
    return 1;
  }

	var ui = SpreadsheetApp.getUi();

	if (! isTemplateAvailable()) {
		ui.alert(
			"New version available",
			"Please, re-open the spreadsheet to update the add-on.",
			ui.ButtonSet.OK);
		return 1;
	}

	showDialogUpdate();

	const r = update_();

	if (r === 0) {
		ui.alert(
			"Update successful",
			"The update process is complete!",
			ui.ButtonSet.OK);
		return;

	} else if (r === 1) {
		ui.alert(
			"Can't update",
			"The add-on is busy. Try again in a moment.",
			ui.ButtonSet.OK);

	} else if (r === 2) {
		ui.alert(
			"Update failed",
			"Something went wrong. Please, try again later.",
			ui.ButtonSet.OK);

	} else if (r > 2) {
		uninstall_();
		onOpen();
		showDialogErrorMessage();
	}

	return 1;
}

function seamlessUpdate_() {
	if (! isTemplateAvailable()) return 1;

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
        if (PATCH_THIS['beta_list'].length === 0 || v0.beta >= PATCH_THIS['beta_list'].length) return 1;
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

  var class_version2 = CacheService2.get("document", "class_version2", "json");
  if (!class_version2) {
    class_version2 = PropertiesService2.getProperty("document", "class_version2", "json");
    if (!class_version2) {
      ConsoleLog.warn("getClassVersion_(): Invalid 'class_version2' value.");
      return 1;
    }

    CacheService2.put("document", "class_version2", "json", class_version2);
  }

  return class_version2[property];
}

function setClassVersion_ (property, value) {
  if (property !== 'script' && property !== 'template') {
    ConsoleLog.warn("setClassVersion_(): Invalid 'property' value.", { property: property });
    return 1;
  }

  var lock = LockService.getDocumentLock();
  try {
    lock.waitLock(200);
  } catch (err) {
    ConsoleLog.warn(err);
    return 1;
  }

  const class_version2 = PropertiesService2.getProperty("document", "class_version2", "json");
  if (!class_version2) {
    ConsoleLog.warn("setClassVersion_(): Invalid 'class_version2' value.");
    return 1;
  }

  class_version2[property] = value;

  PropertiesService2.setProperty("document", "class_version2", "json", class_version2);
  CacheService2.put("document", "class_version2", "json", class_version2);
  lock.releaseLock();
  return 0;
}

/**
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 *
 * 0.0.0
 *
function update_v0m0p0_() {
  try {
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}*/

/**
 * Fix cleared range reference for averages.
 *
 * 0.35.2
 */
function update_v0m35p2_ () {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
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
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Summary');
    if (!sheet) return;

    var i;

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
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Summary');
    var i;

    if (!sheet) return;

    const h_ = TABLE_DIMENSION.height;

    sheet.getRange(2, 13, 3, 1).setFormulas([
      ["'_Settings'!B3"],
      ["'_Settings'!B4"],
      ["'_Settings'!B6"]
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
      "=IF(_Settings!$B6 > 0;  {SUM(OFFSET($D10; '_Settings'!$B4; 0; '_Settings'!$B6; 1)); AVERAGE(OFFSET($D10; '_Settings'!$B4; 0; '_Settings'!$B6; 1))}; {0; 0})", null,
      "=IF(_Settings!$B6 > 0;  {SUM(OFFSET($F10; '_Settings'!$B4; 0; '_Settings'!$B6; 1)); AVERAGE(OFFSET($F10; '_Settings'!$B4; 0; '_Settings'!$B6; 1))}; {0; 0})", null,
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

    var chart = sheet.newChart()
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
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet;
    var expr1, expr2, expr3, expr4;

    const h_ = TABLE_DIMENSION.height;
    const w_ = TABLE_DIMENSION.width;

    const num_acc = getConstProperties_('number_accounts');

    for (var i = 0; i < 12; i++) {
      sheet = spreadsheet.getSheetByName(MN_SHORT[i]);
      if (!sheet) continue;

      for (k = 0; k < num_acc; k++) {
        expr1 = "TEXT('_Backstage'!" + rollA1Notation(2 + h_ * i, 8 + w_ * k) + '; "#,##0.00;-#,##0.00")';
        expr1 = '"Withdrawal: ["; \'_Backstage\'!' + rollA1Notation(2 + h_ * i, 9 + w_ * k) + '; "] "; ' + expr1 + '; "\n"; ';

        expr2 = "TEXT('_Backstage'!" + rollA1Notation(3 + h_ * i, 8 + w_ * k) + '; "#,##0.00;-#,##0.00")';
        expr2 = '"Deposit: ["; \'_Backstage\'!' + rollA1Notation(3 + h_ * i, 9 + w_ * k) + '; "] "; ' + expr2 + '; "\n"; ';

        expr3 = "TEXT('_Backstage'!" + rollA1Notation(4 + h_ * i, 8 + w_ * k) + '; "#,##0.00;-#,##0.00")';
        expr3 = '"Trf. in: ["; \'_Backstage\'!' + rollA1Notation(4 + h_ * i, 9 + w_ * k) + '; "] "; ' + expr3 + '; "\n"; ';

        expr4 = "TEXT('_Backstage'!" + rollA1Notation(5 + h_ * i, 8 + w_ * k) + '; "#,##0.00;-#,##0.00")';
        expr4 = '"Trf. out: ["; \'_Backstage\'!' + rollA1Notation(5 + h_ * i, 9 + w_ * k) + '; "] "; ' + expr4;

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
function update_v0m34p10_() {
  try {
    SpreadsheetApp.getActiveSpreadsheet().setRecalculationInterval(SpreadsheetApp.RecalculationInterval.ON_CHANGE);
  } catch (err) {
    ConsoleLog.error(err);
  }
}

/**
 * Set spreadsheet settings 'optimize_load'.
 *
 * 0.34.7
 */
function update_v0m34p7_() {
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
function update_v0m34p0_() {
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
function update_v0m33p9_() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('_Backstage');
    if (!sheet) return 1;

    const h_ = TABLE_DIMENSION.height;
    const w_ = TABLE_DIMENSION.width;

    const db_accounts = getDbTables_('accounts');
    var account, list, col, i, k;

    for (k = 0; k < db_accounts.data.length; k++) {
      account = db_accounts.data[k];
      col = 2 + w_ + w_*k;
      list = [];

      for (i = 1; i < 12; i++) {
        list[i - 1] = rollA1Notation(2 + h_ * i, col);
      }

      sheet.getRange(2, col).setFormula('0');
      sheet.getRangeList(list).setFormulaR1C1('R[-' + (h_ - 1) + ']C');
      sheet.getRange(2 + h_ * account.time_a, col).setFormula('=' + numberFormatLocaleSignal.call(account.balance));
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
function update_v0m33p2_() {
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
function update_v0m33p1_() {
	try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Tags');
    var rules, rule;
    if (!sheet) return;

    var maxRows = sheet.getMaxRows() - 1;
    if (maxRows < 1) return;

    rule = SpreadsheetApp.newDataValidation()
      .requireFormulaSatisfied('=REGEXMATCH($E2; \"^\\w+$\")')
      .setHelpText('Accepted charset: 0-9, a-z, A-Z, _')
      .setAllowInvalid(true)
      .build();
    sheet.getRange(2, 5, maxRows, 1).clearDataValidations().setDataValidation(rule);

    sheet.clearConditionalFormatRules();
    rules = sheet.getConditionalFormatRules();

    range = sheet.getRange(2, 6, maxRows, 12);
    rule = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied("=COLUMN() - 5 < INDIRECT(\"'_Settings'!B4\")")
      .setFontColor("#cccccc")
      .setRanges([range])
      .build();
    rules.push(rule);

    range = sheet.getRange(2, 6, maxRows, 12);
    rule = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied("=COLUMN() - 5 > INDIRECT(\"'_Settings'!B4\") - 1 + INDIRECT(\"'_Settings'!B6\")")
      .setFontColor("#999999")
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
function update_v0m33p0_() {
  try {
    var rr;
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var i;

    const limits = [];
    const sheets = [];

    for (i = 0; i < 12; i++) {
      sheets[i] = spreadsheet.getSheetByName(MN_SHORT[i]);
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

function update_v0m33p0s3_(spreadsheet) {
  try {
    var sheet = spreadsheet.getSheetByName('Tags');
    var formula;
    if (!sheet) return;

    var n = sheet.getMaxRows() - 1;
    if (n < 1) return;

    var rules = sheet.getConditionalFormatRules();

    var range = sheet.getRange(2, 5, n, 1);
    var rule = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied("=REGEXMATCH($E2; \"^\\w+$\") = FALSE")
      .setFontColor("#cccccc")
      .setRanges([range])
      .build();

    rules.push(rule);
    sheet.setConditionalFormatRules(rules);

    formula = "ARRAYFORMULA(IF(E2:E <> \"\"; $T$2:$T/\'_Settings\'!B6; ))";
    formula = "IF(\'_Settings\'!$B$6 > 0; " + formula + "; ARRAYFORMULA($F$2:$F * 0))";
    formula = "IF(\'_Settings\'!$B$7 > 0; " + formula + "; \"\")";
    formula = "{\"average\"; " + formula + "}";
    sheet.getRange(1, 19).setFormula(formula);

    formula = "IF(COLUMN(" + rollA1Notation(2, 6, n, 12) + ") - 5 < \'_Settings\'!$B$4 + \'_Settings\'!$B$6; ROW(" + rollA1Notation(2, 6, n) + "); 0)";
    formula = "IF(COLUMN(" + rollA1Notation(2, 6, n, 12) + ") - 5 >= \'_Settings\'!$B$4; " + formula + "; 0)";
    formula = "ARRAYFORMULA(IF(E2:E <> \"\"; SUMIF(" + formula + "; ROW(" + rollA1Notation(2, 6, n) + "); " + rollA1Notation(2, 6, n) + "); ))";
    formula = "IF(\'_Settings\'!$B$6 > 0; " + formula + "; ARRAYFORMULA($F$2:$F * 0))";
    formula = "IF(\'_Settings\'!$B$7 > 0; " + formula + "; \"\")";
    formula = "{\"total\"; " + formula + "}";
    sheet.getRange(1, 20).setFormula(formula);

    formatTags_();
  } catch (err) {
    ConsoleLog.error(err);
  }
}

function update_v0m33p0s2_(spreadsheet, limits) {
  try {
    var sheet, formula;
    var header, header2;
    var limit, i, k;

    sheet = spreadsheet.getSheetByName('Cards');
    if (!sheet) return;
    limit = sheet.getMaxRows();
    if (limit < 7) return;
    limit -= 5

    sheet = spreadsheet.getSheetByName('_Backstage');
    if (!sheet) return 1;

    const h_ = TABLE_DIMENSION.height;
    const w_ = TABLE_DIMENSION.width;

    const dec_p = getSpreadsheetSettings_('decimal_separator');
    const num_acc = getConstProperties_('number_accounts');

    const dec_c = (dec_p ? "," : "\\");
    const col = 2 + w_ + w_*num_acc + w_;

    const range2 = [];
    const range3 = [];
    const range4 = [];
    const range5 = [];

    for (i = 0; i < 12; i++) {
      range2[i] = rollA1Notation(6, 2 + 6*i, limit);
      range3[i] = rollA1Notation(6, 3 + 6*i, limit);
      range4[i] = rollA1Notation(6, 4 + 6*i, limit);
      range5[i] = rollA1Notation(6, 5 + 6*i, limit);
    }

    for(k = 0; k < 10; k++) {
      header = rollA1Notation(1, col + w_*k);

      for(i = 0; i < 12; i++) {
        header2 = rollA1Notation(2 + h_*i, col + 4 + w_*k);

        formula = "IFERROR(IF(" + header + " = \"\"; \"\"; SUM(FILTER(";
        formula += "ARRAY_CONSTRAIN(\'Cards\'!" + range4[i] + "; " + header2 + "; 1); ";
        formula += "REGEXMATCH(ARRAY_CONSTRAIN(\'Cards\'!" + range3[i] + "; " + header2 + "; 1); " + header + "); ";
        formula += "NOT(ISBLANK(ARRAY_CONSTRAIN(\'Cards\'!" + range4[i] + "; " + header2 + "; 1))); ";
        formula += "ARRAY_CONSTRAIN(\'Cards\'!" + range4[i] + "; " + header2 + "; 1) >= 0";
        formula += "))); 0)"
        sheet.getRange(3 + h_*i, col + w_*k).setFormula(formula);

        formula = "IFERROR(IF(" + header + " = \"\"; \"\"; SUM(FILTER(";
        formula += "ARRAY_CONSTRAIN(\'Cards\'!" + range4[i] + "; " + header2 + "; 1); ";
        formula += "REGEXMATCH(ARRAY_CONSTRAIN(\'Cards\'!" + range3[i] + "; " + header2 + "; 1); " + header + "); ";
        formula += "NOT(ISBLANK(ARRAY_CONSTRAIN(\'Cards\'!" + range4[i] + "; " + header2 + "; 1))); ";
        formula += "ARRAY_CONSTRAIN(\'Cards\'!" + range4[i] + "; " + header2 + "; 1) < 0; ";
        formula += "NOT(REGEXMATCH(ARRAY_CONSTRAIN(\'Cards\'!" + range5[i] + "; " + header2 + "; 1); ";
        formula += "\"#ign\"))";
        formula += "))); 0)"
        sheet.getRange(4 + h_*i, col + w_*k).setFormula(formula);

        formula = "IFERROR(IF(" + header + " = \"\"; \"\"; SUM(FILTER(";
        formula += "ARRAY_CONSTRAIN(\'Cards\'!" + range4[i] + "; " + header2 + "; 1); ";
        formula += "REGEXMATCH(ARRAY_CONSTRAIN(\'Cards\'!" + range3[i] + "; " + header2 + "; 1); " + header + "); ";
        formula += "NOT(ISBLANK(ARRAY_CONSTRAIN(\'Cards\'!" + range4[i] + "; " + header2 + "; 1))); ";
        formula += "ARRAY_CONSTRAIN(\'Cards\'!" + range4[i] + "; " + header2 + "; 1) < 0";
        formula += "))); 0)"
        sheet.getRange(5 + h_*i, col + w_*k).setFormula(formula);

        formula = "REGEXEXTRACT(ARRAY_CONSTRAIN(\'Cards\'!" + range2[i] + "; " + header2 + "; 1); \"[0-9]+/[0-9]+\")";
        formula = "ARRAYFORMULA(SPLIT(" + formula + "; \"/\"))";
        formula = "{" + formula + dec_c + " ARRAY_CONSTRAIN(\'Cards\'!" + range4[i] + "; " + header2 + "; 1)}; ";
        formula = formula + "REGEXMATCH(ARRAY_CONSTRAIN(\'Cards\'!" + range3[i] + "; " + header2 + "; 1); " + rollA1Notation(1, col + w_*k) + "); ";

        formula = formula + "NOT(ISBLANK(ARRAY_CONSTRAIN(\'Cards\'!" + range4[i] + "; " + header2 + "; 1))); ";
        formula = formula + "REGEXMATCH(ARRAY_CONSTRAIN(\'Cards\'!" + range2[i] + "; " + header2 + "; 1); \"[0-9]+/[0-9]+\")";

        formula = "BSCARDPART(TRANSPOSE(IFNA(FILTER(" + formula + "); 0)))";
        formula = "IF(" + rollA1Notation(1, col + w_*k) + " = \"\"; 0; " + formula + ")";

        sheet.getRange(5 + h_*i, 1 + col + w_*k).setFormula(formula);
      }
    }

    SpreadsheetApp.flush();
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

function update_v0m33p0s1_(spreadsheet, limits) {
  try {
    var sheet, formula, limit, rg, cd;
    var i, k;

    sheet = spreadsheet.getSheetByName('Cards');
    if (!sheet) return;
    limit = sheet.getMaxRows();

    sheet = spreadsheet.getSheetByName('Tags');
    if (!sheet) return;

    const h_ = TABLE_DIMENSION.height;
    const w_ = TABLE_DIMENSION.width;

    const num_acc = getConstProperties_('number_accounts');

    const col = 11 + w_*num_acc;

    const tags = [ "I5:I", "N5:N", "S5:S", "X5:X", "AC5:AC" ];
    const combo = [ "H5:I", "M5:N", "R5:S", "W5:X", "AB5:AC" ];

    i = -1;
    while (++i < 12) {
      if (limits[i] < 6) continue;

      rg = "{ARRAY_CONSTRAIN(\'" + MN_SHORT[i] + "\'!C5:D" + limits[i] + "; \'_Backstage\'!" + rollA1Notation(2 + h_*i, 6) + "; 2)";
      cd = "{ARRAY_CONSTRAIN(\'" + MN_SHORT[i] + "\'!D5:D" + limits[i] + "; \'_Backstage\'!" + rollA1Notation(2 + h_*i, 6) + "; 1)";

      for (k = 0; k < num_acc; k++) {
        rg += "; ARRAY_CONSTRAIN(\'" + MN_SHORT[i] + "\'!" + combo[k] + limits[i] + "; \'_Backstage\'!" + rollA1Notation(2 + h_*i, 6 + w_*k) + "; 2)";
        cd += "; ARRAY_CONSTRAIN(\'" + MN_SHORT[i] + "\'!" + tags[k] + limits[i] + "; \'_Backstage\'!" + rollA1Notation(2 + h_*i, 6 + w_*k) + "; 1)";
      }

      if (limit > 6) {
        rg += "; ARRAY_CONSTRAIN(\'Cards\'!" + rollA1Notation(6, 4 + 6*i, limit - 5, 2) + "; \'_Backstage\'!" + rollA1Notation(2 + h_*i, col) + "; 2)}";
        cd += "; ARRAY_CONSTRAIN(\'Cards\'!" + rollA1Notation(6, 5 + 6*i, limit - 5, 1) + "; \'_Backstage\'!" + rollA1Notation(2 + h_*i, col) + " ; 1)}";
      } else {
        rg += "}";
        cd += "}"
      }

      formula = "IFERROR(FILTER(" + rg + "; NOT(ISBLANK(" + cd + "))); \"\")";
      formula = "BSSUMBYTAG(TRANSPOSE($E$1:$E); " + formula + ")";
      formula = "{\"" + MN_FULL[i] + "\"; IF(\'_Settings\'!$B$7 > 0; " + formula + "; )}";

      sheet.getRange(1, 6 + i).setFormula(formula);
    }

    SpreadsheetApp.flush();
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }
}

function update_v0m33p0s0_(spreadsheet, limits) {
  try {
    var sheet = spreadsheet.getSheetByName('_Backstage');
    var i, k;

    if (!sheet) return 1;

    const h_ = TABLE_DIMENSION.height;
    const w_ = TABLE_DIMENSION.width;

    const num_acc = getConstProperties_('number_accounts');
    const dec_p = getSpreadsheetSettings_('decimal_separator');

    const col = 2 + w_ + w_*num_acc + w_;
    const dec_c = (dec_p ? "," : "\\");

    const values = [ "H5:H", "M5:M", "R5:R", "W5:W", "AB5:AB" ];
    const tags = [ "I5:I", "N5:N", "S5:S", "X5:X", "AC5:AC" ];
    const combo = [ "H5:I", "M5:N", "R5:S", "W5:X", "AB5:AC" ];
    const balance1 = [ "G2", "L2", "Q2", "V2", "AA2", "G12", "L12", "Q12", "V12", "AA12", "G22", "L22", "Q22", "V22", "AA22", "G32", "L32", "Q32", "V32", "AA32", "G42", "L42", "Q42", "V42", "AA42", "G52", "L52", "Q52", "V52", "AA52", "G62", "L62", "Q62", "V62", "AA62", "G72", "L72", "Q72", "V72", "AA72", "G82", "L82", "Q82", "V82", "AA82", "G92", "L92", "Q92", "V92", "AA92", "G102", "L102", "Q102", "V102", "AA102", "G112", "L112", "Q112", "V112", "AA112" ];

    i = -1;
    while (++i < 12) {
      if (limits[i] < 6) continue;

      formula = "NOT(REGEXMATCH(ARRAY_CONSTRAIN(\'" + MN_SHORT[i] + "\'!D5:D" + limits[i] + "; " + rollA1Notation(2 + h_*i, 6) + "; 1); \"#ign\"))";
      formula = "NOT(ISBLANK(ARRAY_CONSTRAIN(\'" + MN_SHORT[i] + "\'!C5:C" + limits[i] + "; " + rollA1Notation(2 + h_*i, 6) + "; 1))); " + formula;
      formula = "FILTER(ARRAY_CONSTRAIN(\'" + MN_SHORT[i] + "\'!C5:C" + limits[i] + "; " + rollA1Notation(2 + h_*i, 6) + "; 1); " + formula + ")";
      formula = "SUM(IFERROR(" + formula + "; 0))";
      sheet.getRange(4 + h_*i, 2).setFormula(formula);

      for (k = 0; k < num_acc; k++) {
        formula = "NOT(ISBLANK(ARRAY_CONSTRAIN(\'" + MN_SHORT[i] + "\'!" + values[k] + limits[i] + "; " + rollA1Notation(2 + h_*i, 11 + w_*k) + "; 1)))";
        formula = "FILTER(ARRAY_CONSTRAIN(\'" + MN_SHORT[i] + "\'!" + values[k] + limits[i] + "; " + rollA1Notation(2 + h_*i, 11 + w_*k) + "; 1); " + formula + ")";
        formula = balance1[5*i + k] + " + IFERROR(SUM(" + formula + "); 0)";
        sheet.getRange(3 + h_*i, 7 + w_*k).setFormula(formula);

        formula = "NOT(REGEXMATCH(ARRAY_CONSTRAIN(\'" + MN_SHORT[i] + "\'!" + tags[k] + limits[i] + "; " + rollA1Notation(2 + h_*i, 11 + w_*k) + "; 1); \"#(dp|wd|qcc|ign|rct|trf)\"))";
        formula = "NOT(ISBLANK(ARRAY_CONSTRAIN(\'" + MN_SHORT[i] + "\'!" + values[k] + limits[i] + "; " + rollA1Notation(2 + h_*i, 11 + w_*k) + "; 1))); " + formula;
        formula = "FILTER(ARRAY_CONSTRAIN(\'" + MN_SHORT[i] + "\'!" + values[k] + limits[i] + "; " + rollA1Notation(2 + h_*i, 11 + w_*k) + "; 1); " + formula + ")";
        formula = "IFERROR(SUM(" + formula + "); 0)";
        sheet.getRange(4 + h_*i, 7 + w_*k).setFormula(formula);

        formula = "NOT(ISBLANK(ARRAY_CONSTRAIN(\'" + MN_SHORT[i] + "\'!" + tags[k] + limits[i] + "; " + rollA1Notation(2 + h_*i, 11 + w_*k) + "; 1)))";
        formula = "IFERROR(FILTER(ARRAY_CONSTRAIN(\'" + MN_SHORT[i] + "\'!" + combo[k] + limits[i] + "; " + rollA1Notation(2 + h_*i, 11 + w_*k) + "; 2); " + formula + "); \"\")";
        formula = "BSREPORT(TRANSPOSE(" + formula + "))";
        sheet.getRange(2 + h_*i, 8 + w_*k).setFormula(formula);
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
function update_v0m32p7_() {
	try {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
    var backstage = spreadsheet.getSheetByName('_Backstage')
    var wallet, accounts, cards
    var col, n, i, k

    if (!backstage) return

    const h_ = TABLE_DIMENSION.height
    const w_ = TABLE_DIMENSION.width

    const height = 120
    const num_acc = getConstProperties_('number_accounts')

    wallet = new Array(height)
    cards = new Array(height)

    accounts = []
    for (k = 0; k < num_acc; k++) {
      accounts[k] = new Array(height)
    }

    n = height;
    while (n--) {
      wallet[n] = [null]
      cards[n] = [null]

      for (k = 0; k < num_acc; k++) {
        accounts[k][n] = [null]
      }
    }

    for (i = 0; i < 12; i++) {
      sheet = spreadsheet.getSheetByName(MN_SHORT[i])
      if (!sheet) continue
      n = sheet.getMaxRows() - 4
      if (n < 1) continue

      wallet[h_*i] = ['BSBLANK(TRANSPOSE(\'' + MN_SHORT[i] + '\'!' + rollA1Notation(5, 3, n, 1) + '))']
      for (k = 0; k < num_acc; k++) {
        accounts[k][h_*i] = ['BSBLANK(TRANSPOSE(\'' + MN_SHORT[i] + '\'!' + rollA1Notation(5, 8 + 5*k, n, 1) + '))']
      }
    }

    backstage.getRange(2, 6, height, 1).setFormulas(wallet)
    for (k = 0; k < num_acc; k++) {
      backstage.getRange(2, 11 + w_*k, height, 1).setFormulas(accounts[k])
    }

    sheet = spreadsheet.getSheetByName('Cards')
    if (!sheet) return
    n = sheet.getMaxRows() - 5
    if (n < 1) return

    for (i = 0; i < 12; i++) {
      cards[h_*i] = ['BSBLANK(TRANSPOSE(\'Cards\'!' + rollA1Notation(6, 4 + 6*i, n, 1) + '))']
    }
    backstage.getRange(2, 6 + w_*num_acc + w_, height, 1).setFormulas(cards)

    col = 16 + w_*num_acc
    for (k = 0; k < 10; k++) {
      list = []
      for (i = 0; i < 12; i++) {
        list[i] = rollA1Notation(2 + h_*i, col + w_*k)
      }
      backstage.getRangeList(list).setFormulaR1C1("RC[-" + (w_ + w_*k) + "]");
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
function update_v0m32p6_() {
	try {
		var triggers = ScriptApp.getUserTriggers( SpreadsheetApp.getActiveSpreadsheet() );

		for (var i = 0; i < triggers.length; i++) {
			if (triggers[i].getEventType() == ScriptApp.EventType.CLOCK) {
				ScriptApp.deleteTrigger(triggers[i]);
			}
		}

		var yyyy = DATE_NOW.getFullYear();
		var trigger, day;

		const hour = 2 + randomInteger(4);
		const financial_year = getConstProperties_("financial_year");

		if (financial_year < yyyy) {
			day = 1 + randomInteger(28);
			trigger = createNewTrigger_('weeklyTriggerPos_', 'onMonthDay', { days: day, hour: hour })
      saveTriggerId_(trigger, 'document', 'clockTriggerId')

		} else if (financial_year == yyyy) {
			trigger = createNewTrigger_('dailyTrigger_', 'everyDays', { days: 1, hour: hour })
      saveTriggerId_(trigger, 'document', 'clockTriggerId')

		} else if (financial_year > yyyy) {
			day = new Date(financial_year, 0, 2).getDay();
			trigger = createNewTrigger_('weeklyTriggerPre_', 'onWeekDay', { weeks: 1, week: day, hour: hour })
      saveTriggerId_(trigger, 'document', 'clockTriggerId')
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
function update_v0m32p2_() {
	try {
    var rr;

		update_v0m32p2s0_();

    rr = update_v0m32p2s1_();
		if (rr) return rr;
	} catch (err) {
		ConsoleLog.error(err);
		return 2;
	}
}

function update_v0m32p2s1_() {
	try {
		var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
		var template;
		var sheet, tmp, ranges, n;

		sheet = spreadsheet.getSheetByName("Quick Actions");
		if (!sheet) return;

		template = SpreadsheetApp.openById(APPS_SCRIPT_GLOBAL.template_id);

		tmp = spreadsheet.insertSheet();

		n = sheet.getIndex();
		spreadsheet.deleteSheet(sheet);

		sheet = template.getSheetByName("Quick Actions")
			.copyTo(spreadsheet)
			.setName("Quick Actions");

		sheet.setTabColor("#6aa84f");

		ranges = [ ];
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

function update_v0m32p2s0_() {
	try {
		var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Tags");
		if (!sheet) return;

		sheet.getRange(1, 1, 1, 5).setValues([
			[ "name", "category", "description", "analytics", "code" ]
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
function update_v0m31p8_() {
	try {
		var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("_Backstage");
		var card, ranges, text, i, j;

		const h_ = TABLE_DIMENSION.height;
		const w_ = TABLE_DIMENSION.width;

		const db_cards = getDbTables_("cards");
		const num_acc = getConstProperties_("number_accounts");
		const col = 2 + w_ + w_*num_acc + w_ + 1;

		if (!sheet) return;

		for (i = 0; i < db_cards.count; i++) {
			card = db_cards.data[i];

			ranges = [ ];
			for (j = 0; j < 12; j++) {
				ranges[j] = rollA1Notation(2 + h_*j, col + w_*i);
			}

			limit = "=" + numberFormatLocaleSignal.call(card.limit);
			text = "^" + card.code + "$";
			for (j = 0; j < card.aliases.length; j++) {
				text += "|^" + card.aliases[j] + "$";
			}

			sheet.getRange(1, col + w_*i - 1).setValue(text);
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
function update_v0m31p7_() {
	try {
		var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("_Backstage");
		var formula, i;

		if (!sheet) return;

		const h_ = TABLE_DIMENSION.height;

		for (i = 0; i < 12; i++) {
			formula = "NOT(REGEXMATCH(\'" + MN_SHORT[i] + "\'!D5:D404; \"#ign\"))";
			formula = "NOT(ISBLANK(\'" + MN_SHORT[i] + "\'!C5:C404)); " + formula;
			formula = "FILTER(\'" + MN_SHORT[i] + "\'!C5:C404; " + formula + ")";
			formula = "SUM(IFNA(" + formula + "; 0))";

			sheet.getRange(4 + h_*i, 2).setFormula(formula);
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
function update_v0m31p6_() {
	try {
		var documentProperties = PropertiesService.getDocumentProperties();

		if (documentProperties.getProperty("is_installed") !== "true") documentProperties.setProperty("is_installed", "true");
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
function update_v0m31p0_() {
	try {
		const cp = PropertiesService2.getProperty("document", "const_properties", "json");

		var admin;

		if (cp.addon_user) admin = cp.addon_user;
		else admin = setUserId_();

		properties = {
			admin_id: admin,
			isChangeableByEditors: false
		};
		PropertiesService2.setProperty("document", "admin_settings", "json", properties);
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
function update_v0m30p6_() {
	try {
		setUserId_();


		const handlers = [ "onOpenInstallable_", "onEditInstallable_", "dailyTrigger_", "weeklyTriggerPos_", "weeklyTriggerPre_" ];
		const financial_year = getConstProperties_("financial_year");

		var triggers, trigger, yyyy, dd, name;
		var eventType, installClock, installOnEdit;

		installClock = false;
		installOnEdit = false;
		triggers = ScriptApp.getUserTriggers( SpreadsheetApp.getActiveSpreadsheet() );

		for (var i = 0; i < triggers.length; i++) {
			name = triggers[i].getHandlerFunction();
			if (handlers.indexOf(name) != -1) continue;

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
        console.info("update_v0m30p6_(): Switch case is default.", eventType);
				break;
			}
		}

		if (installOnEdit) {
			trigger = createNewTrigger_('onEditInstallable_', 'onEdit')
      saveTriggerId_(trigger, 'document', 'onEditTriggerId')
		}

		if (installClock) {
			yyyy = DATE_NOW.getFullYear();
			if (financial_year < yyyy) {
				trigger = createNewTrigger_('weeklyTriggerPos_', 'onWeekDay', { weeks: 1, week: 2 })
        saveTriggerId_(trigger, 'document', 'clockTriggerId')

			} else if (financial_year == yyyy) {
				trigger = createNewTrigger_('dailyTrigger_', 'everyDays', { days: 1, hour: 2 })
        saveTriggerId_(trigger, 'document', 'clockTriggerId')

			} else if (financial_year > yyyy) {
				dd = new Date(financial_year, 0, 2).getDay();
				trigger = createNewTrigger_('weeklyTriggerPre_', 'onWeekDay', { weeks: 1, week: dd })
        saveTriggerId_(trigger, 'document', 'clockTriggerId')
			}
		}


		PropertiesService2.deleteProperty("document", "onEditMainId");
		PropertiesService2.deleteProperty("document", "dailyMainId");
		PropertiesService2.deleteProperty("document", "weeklyMainId");
	} catch (err) {
    ConsoleLog.error(err);
		return 2;
	}
}
