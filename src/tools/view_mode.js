function toggleViewMode_ () {
  const lock = LockService.getDocumentLock();
  try {
    lock.waitLock(200);
  } catch (err) {
    SpreadsheetApp.getUi().alert(
      'Add-on is busy',
      'The add-on is busy. Try again in a moment.',
      SpreadsheetApp.getUi().ButtonSet.OK);

    ConsoleLog.warn(err);
    return;
  }

  let view_mode = getSpreadsheetSettings_('view_mode');

  if (view_mode === 'complete') {
    viewModeSimple_();
    view_mode = 'simple';
  } else {
    viewModeComplete_();
    view_mode = 'complete';
  }

  setSpreadsheetSettings_('view_mode', view_mode);
  lock.releaseLock();
}

function viewModeSimple_ () {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  let sheet, i, k;
  let expr, head, cell;

  const num_acc = getConstProperties_('number_accounts');

  for (i = 0; i < 12; i++) {
    sheet = spreadsheet.getSheetByName(MONTH_NAME.short[i]);
    if (!sheet) continue;
    if (sheet.getMaxRows() < 3) continue;

    sheet.getRange(1, 3, 3, 2).breakApart();
    sheet.getRange(1, 3, 1, 2)
      .merge()
      .setFormulaR1C1('R[2]C[-2]');
    sheet.getRange(1, 1, 1, 2).setBorder(null, null, false, null, null, null);

    for (k = 0; k < num_acc; k++) {
      sheet.getRange(1, 8 + 5 * k, 3, 2).breakApart();
      sheet.getRange(1, 8 + 5 * k, 1, 2)
        .merge()
        .setFormulaR1C1('R[2]C[-2]');
      sheet.getRange(1, 6 + 5 * k, 1, 2).setBorder(null, null, false, null, null, null);
    }

    sheet.hideRows(2, 2);
  }
  SpreadsheetApp.flush();

  sheet = spreadsheet.getSheetByName('Cards');
  if (!sheet) return;
  if (sheet.getMaxRows() < 4) return;

  const h_ = TABLE_DIMENSION.height;
  const w_ = TABLE_DIMENSION.width;

  const col = 2 + w_ + w_ * num_acc;

  for (i = 0; i < 12; i++) {
    head = rollA1Notation(2, 1 + 6 * i);
    cell = '_Backstage!' + rollA1Notation(2 + h_ * i, col);

    expr = 'OFFSET(' + cell + '; 4; 5*' + head + '; 1; 1)';
    expr = '"Balance: "; TEXT(' + expr + '; "#,##0.00;(#,##0.00)")';

    sheet.getRange(2, 4 + 6 * i, 3, 2).breakApart();
    sheet.getRange(2, 4 + 6 * i, 1, 2)
      .merge()
      .setFormula('CONCATENATE(' + expr + ')');
  }

  sheet.hideRows(3, 2);
  SpreadsheetApp.flush();
}

function viewModeComplete_ () {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  let sheet, i, k;
  let formula, expr1, expr2, expr3, expr4;
  let head, cell;

  const h_ = TABLE_DIMENSION.height;
  const w_ = TABLE_DIMENSION.width;
  const num_acc = getConstProperties_('number_accounts');

  for (i = 0; i < 12; i++) {
    sheet = spreadsheet.getSheetByName(MONTH_NAME.short[i]);
    if (!sheet) continue;
    if (sheet.getMaxRows() < 3) continue;

    sheet.showRows(2, 2);

    sheet.getRange(1, 3, 3, 2)
      .merge()
      .clearContent();
    sheet.getRange(1, 1, 1, 2).setBorder(null, null, true, null, null, null, '#000000', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

    for (k = 0; k < num_acc; k++) {
      expr1 = 'TEXT(_Backstage!' + rollA1Notation(2 + h_ * i, 8 + w_ * k) + '; "#,##0.00;-#,##0.00")';
      expr1 = '"Withdrawal: ("; _Backstage!' + rollA1Notation(2 + h_ * i, 9 + w_ * k) + '; ") "; ' + expr1 + '; "\n"; ';

      expr2 = 'TEXT(_Backstage!' + rollA1Notation(3 + h_ * i, 8 + w_ * k) + '; "#,##0.00;-#,##0.00")';
      expr2 = '"Deposit: ("; _Backstage!' + rollA1Notation(3 + h_ * i, 9 + w_ * k) + '; ") "; ' + expr2 + '; "\n"; ';

      expr3 = 'TEXT(_Backstage!' + rollA1Notation(4 + h_ * i, 8 + w_ * k) + '; "#,##0.00;-#,##0.00")';
      expr3 = '"Trf. in: ("; _Backstage!' + rollA1Notation(4 + h_ * i, 9 + w_ * k) + '; ") "; ' + expr3 + '; "\n"; ';

      expr4 = 'TEXT(_Backstage!' + rollA1Notation(5 + h_ * i, 8 + w_ * k) + '; "#,##0.00;-#,##0.00")';
      expr4 = '"Trf. out: ("; _Backstage!' + rollA1Notation(5 + h_ * i, 9 + w_ * k) + '; ") "; ' + expr4;

      sheet.getRange(1, 8 + 5 * k, 3, 2)
        .merge()
        .setFormula('CONCATENATE(' + expr1 + expr2 + expr3 + expr4 + ')');
      sheet.getRange(1, 6 + 5 * k, 1, 2).setBorder(null, null, true, null, null, null, '#000000', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    }
  }
  SpreadsheetApp.flush();

  sheet = spreadsheet.getSheetByName('Cards');
  if (!sheet) return;
  if (sheet.getMaxRows() < 4) return;

  const col = 2 + w_ + w_ * num_acc;

  sheet.showRows(3, 2);

  for (i = 0; i < 12; i++) {
    head = rollA1Notation(2, 1 + 6 * i);
    cell = '_Backstage!' + rollA1Notation(2 + h_ * i, col);

    expr1 = 'OFFSET(' + cell + '; 1; 5*' + head + '; 1; 1)';
    expr1 = '"Credit: "; TEXT(' + expr1 + '; "#,##0.00;(#,##0.00)"); "\n"; ';

    expr2 = 'OFFSET(' + cell + '; 3; 5*' + head + '; 1; 1)';
    expr2 = '"Expenses: "; TEXT(' + expr2 + '; "#,##0.00;(#,##0.00)"); "\n"; ';

    expr3 = 'OFFSET(' + cell + '; 4; 5*' + head + '; 1; 1)';
    expr3 = '"Balance: "; TEXT(' + expr3 + '; "#,##0.00;(#,##0.00)")';

    formula = 'CONCATENATE(' + expr1 + expr2 + '"\n"; ' + expr3 + ')';
    sheet.getRange(2, 4 + 6 * i, 3, 2).merge().setFormula(formula);
  }
  SpreadsheetApp.flush();
}
