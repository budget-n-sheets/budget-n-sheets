function viewModeSimple() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  var sheet, i, k

  const num_acc = getConstProperties_('number_accounts')

  for (i = 0; i < 12; i++) {
    sheet = spreadsheet.getSheetByName(MN_SHORT[i])
    if (!sheet) continue
    if (sheet.getMaxRows() < 3) continue

    sheet.getRange(1, 3, 3, 2).breakApart()
    sheet.getRange(1, 3, 1, 2)
      .merge()
      .setFormulaR1C1('R[2]C[-2]')
    sheet.getRange(1, 1, 1, 2).setBorder(null, null, false, null, null, null)

    for (k = 0; k < num_acc; k++) {
      sheet.getRange(1, 8 + 5*k, 3, 2).breakApart()
      sheet.getRange(1, 8 + 5*k, 1, 2)
        .merge()
        .setFormulaR1C1('R[2]C[-2]')
      sheet.getRange(1, 6 + 5*k, 1, 2).setBorder(null, null, false, null, null, null)
    }

    sheet.hideRows(2, 2)
  }

  sheet = spreadsheet.getSheetByName('Cards')
  if (!sheet) return
  if (sheet.getMaxRows() < 4) return
  sheet.hideRows(2, 3)
}

function viewModeComplete() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  var sheet, i, k
  var expr1, expr2, expr3, expr4

  const h_ = TABLE_DIMENSION.height;
  const w_ = TABLE_DIMENSION.width;
  const num_acc = getConstProperties_('number_accounts')

  for (i = 0; i < 12; i++) {
    sheet = spreadsheet.getSheetByName(MN_SHORT[i])
    if (!sheet) continue
    if (sheet.getMaxRows() < 3) continue

    sheet.showRows(2, 2)

    sheet.getRange(1, 3, 3, 2)
      .merge()
      .clearContent()
    sheet.getRange(1, 1, 1, 2).setBorder(null, null, true, null, null, null, '#000000', SpreadsheetApp.BorderStyle.SOLID_MEDIUM)

    for (k = 0; k < num_acc; k++) {
      expr1 = "TEXT(\'_Backstage\'!" + rollA1Notation(2 + h_*i, 8 + w_*k) + "; \"#,##0.00;-#,##0.00\")";
      expr1 = "\"Withdrawal: (\"; \'_Backstage\'!" + rollA1Notation(2 + h_*i, 9 + w_*k) + "; \") \"; " + expr1 + "; \"\n\"; ";

      expr2 = "TEXT(\'_Backstage\'!" + rollA1Notation(3 + h_*i, 8 + w_*k) + "; \"#,##0.00;-#,##0.00\")";
      expr2 = "\"Deposit: (\"; \'_Backstage\'!" + rollA1Notation(3 + h_*i, 9 + w_*k) + "; \") \"; " + expr2 + "; \"\n\"; ";

      expr3 = "TEXT(\'_Backstage\'!" + rollA1Notation(4 + h_*i, 8 + w_*k) + "; \"#,##0.00;-#,##0.00\")";
      expr3 = "\"Trf. in: (\"; \'_Backstage\'!" + rollA1Notation(4 + h_*i, 9 + w_*k) + "; \") \"; " + expr3 + "; \"\n\"; ";

      expr4 = "TEXT(\'_Backstage\'!" + rollA1Notation(5 + h_*i, 8 + w_*k) + "; \"#,##0.00;-#,##0.00\")";
      expr4 = "\"Trf. out: (\"; \'_Backstage\'!" + rollA1Notation(5 + h_*i, 9 + w_*k) + "; \") \"; " + expr4;

      sheet.getRange(1, 8 + 5*k, 3, 2)
        .merge()
        .setFormula('CONCATENATE(' + expr1 + expr2 + expr3 + expr4 + ')')
      sheet.getRange(1, 6 + 5*k, 1, 2).setBorder(null, null, true, null, null, null, '#000000', SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
    }
  }

  sheet = spreadsheet.getSheetByName('Cards')
  if (!sheet) return
  if (sheet.getMaxRows() < 4) return
  sheet.showRows(2, 3)
}
