function toggleViewMode_ () {
  const lock = LockService.getDocumentLock();
  try {
    lock.waitLock(200);
  } catch (err) {
    SpreadsheetApp2.getUi().alert(
      'Add-on is busy',
      'The add-on is busy. Try again in a moment.',
      SpreadsheetApp2.getUi().ButtonSet.OK);

    console.warn(err);
    return;
  }

  let view_mode = SettingsSpreadsheet.getValueOf('view_mode');

  if (view_mode === 'complete') {
    viewModeSimple_();
    view_mode = 'simple';
  } else {
    viewModeComplete_();
    view_mode = 'complete';
  }

  SettingsSpreadsheet.setValueOf('view_mode', view_mode);
  lock.releaseLock();
}

function setViewMode_ (view_mode) {
  if (view_mode === SettingsSpreadsheet.getValueOf('view_mode')) return;

  const lock = LockService.getDocumentLock();
  try {
    lock.waitLock(200);
  } catch (err) {
    console.warn(err);
    return;
  }

  if (view_mode === 'complete') viewModeComplete_();
  else if (view_mode === 'simple') viewModeSimple_();
  else return;

  SettingsSpreadsheet.setValueOf('view_mode', view_mode);
  lock.releaseLock();
}

function viewModeSimple_ () {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  let sheet, i, k;
  let expr, head, cell;

  const num_acc = SettingsConst.getValueOf('number_accounts');

  for (i = 0; i < 12; i++) {
    sheet = spreadsheet.getSheetByName(Consts.month_name.short[i]);
    if (!sheet) continue;
    if (sheet.getMaxRows() < 3) continue;

    {
      const rangeOff = sheet.getRange(1, 3, 1, 2);

      rangeOff.offset(0, 0, 3, 2).breakApart();
      rangeOff.merge().setFormulaR1C1('R[2]C[-2]');
      rangeOff.offset(0, -2).setBorder(null, null, false, null, null, null);
    }

    {
      const rangeOff = sheet.getRange(1, 8, 1, 2);

      for (k = 0; k < num_acc; k++) {
        rangeOff.offset(0, 5 * k, 3, 2).breakApart();
        rangeOff.offset(0, 5 * k)
          .merge()
          .setFormulaR1C1('R[2]C[-2]');
        rangeOff.offset(0, -2 + 5 * k).setBorder(null, null, false, null, null, null);
      }
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

  {
    const rangeOff = sheet.getRange(2, 4, 1, 2);

    for (i = 0; i < 12; i++) {
      head = RangeUtils.rollA1Notation(2, 1 + 6 * i);
      cell = '_Backstage!' + RangeUtils.rollA1Notation(2 + h_ * i, col);

      expr = 'OFFSET(' + cell + '; 4; 5*' + head + '; 1; 1)';
      expr = '"Balance: "; TEXT(' + expr + '; "#,##0.00;(#,##0.00)")';

      rangeOff.offset(0, 6 * i, 3, 2).breakApart();
      rangeOff.offset(0, 6 * i)
        .merge()
        .setFormula('CONCATENATE(' + expr + ')');
    }
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
  const num_acc = SettingsConst.getValueOf('number_accounts');

  for (i = 0; i < 12; i++) {
    sheet = spreadsheet.getSheetByName(Consts.month_name.short[i]);
    if (!sheet) continue;
    if (sheet.getMaxRows() < 3) continue;

    sheet.showRows(2, 2);

    let rangeOff = sheet.getRange(1, 1, 1, 2);

    rangeOff.offset(0, 2, 3, 2)
      .merge()
      .clearContent();
    rangeOff.setBorder(null, null, true, null, null, null, '#000000', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

    rangeOff = rangeOff.offset(0, 5);
    for (k = 0; k < num_acc; k++) {
      expr1 = 'TEXT(_Backstage!' + RangeUtils.rollA1Notation(2 + h_ * i, 8 + w_ * k) + '; "#,##0.00;-#,##0.00")';
      expr1 = '"Withdrawal: ("; _Backstage!' + RangeUtils.rollA1Notation(2 + h_ * i, 9 + w_ * k) + '; ") "; ' + expr1 + '; "\n"; ';

      expr2 = 'TEXT(_Backstage!' + RangeUtils.rollA1Notation(3 + h_ * i, 8 + w_ * k) + '; "#,##0.00;-#,##0.00")';
      expr2 = '"Deposit: ("; _Backstage!' + RangeUtils.rollA1Notation(3 + h_ * i, 9 + w_ * k) + '; ") "; ' + expr2 + '; "\n"; ';

      expr3 = 'TEXT(_Backstage!' + RangeUtils.rollA1Notation(4 + h_ * i, 8 + w_ * k) + '; "#,##0.00;-#,##0.00")';
      expr3 = '"Trf. in: ("; _Backstage!' + RangeUtils.rollA1Notation(4 + h_ * i, 9 + w_ * k) + '; ") "; ' + expr3 + '; "\n"; ';

      expr4 = 'TEXT(_Backstage!' + RangeUtils.rollA1Notation(5 + h_ * i, 8 + w_ * k) + '; "#,##0.00;-#,##0.00")';
      expr4 = '"Trf. out: ("; _Backstage!' + RangeUtils.rollA1Notation(5 + h_ * i, 9 + w_ * k) + '; ") "; ' + expr4;

      rangeOff.offset(0, 2 + 5 * k, 3, 2)
        .merge()
        .setFormula('CONCATENATE(' + expr1 + expr2 + expr3 + expr4 + ')');
      rangeOff.offset(0, 5 * k).setBorder(null, null, true, null, null, null, '#000000', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    }
  }
  SpreadsheetApp.flush();

  sheet = spreadsheet.getSheetByName('Cards');
  if (!sheet) return;
  if (sheet.getMaxRows() < 4) return;

  const col = 2 + w_ + w_ * num_acc;

  sheet.showRows(3, 2);

  {
    const rangeOff = sheet.getRange(2, 4, 3, 2);

    for (i = 0; i < 12; i++) {
      head = RangeUtils.rollA1Notation(2, 1 + 6 * i);
      cell = '_Backstage!' + RangeUtils.rollA1Notation(2 + h_ * i, col);

      expr1 = 'OFFSET(' + cell + '; 1; 5*' + head + '; 1; 1)';
      expr1 = '"Credit: "; TEXT(' + expr1 + '; "#,##0.00;(#,##0.00)"); "\n"; ';

      expr2 = 'OFFSET(' + cell + '; 3; 5*' + head + '; 1; 1)';
      expr2 = '"Expenses: "; TEXT(' + expr2 + '; "#,##0.00;(#,##0.00)"); "\n"; ';

      expr3 = 'OFFSET(' + cell + '; 4; 5*' + head + '; 1; 1)';
      expr3 = '"Balance: "; TEXT(' + expr3 + '; "#,##0.00;(#,##0.00)")';

      formula = 'CONCATENATE(' + expr1 + expr2 + '"\n"; ' + expr3 + ')';
      rangeOff.offset(0, 6 * i).merge().setFormula(formula);
    }
  }
  SpreadsheetApp.flush();
}
