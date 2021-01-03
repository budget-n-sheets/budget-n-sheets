function setupMonthSheet_ () {
  const formulaBuild = FormulaBuild.ttt().header();
  let testBuild;

  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  const sheetTTT = spreadsheet.getSheetByName('TTT');
  let sheet, ranges, formula;
  let expr1, expr2, expr3, expr4;
  let i, k;

  const h_ = TABLE_DIMENSION.height;
  const w_ = TABLE_DIMENSION.width;

  const list_acc = SETUP_SETTINGS.list_acc;
  const num_acc = SETUP_SETTINGS.number_accounts;

  const sheets = new Array(12);

  const headers = [];
  for (k = 0; k < 1 + num_acc; k++) {
    headers[k] = rollA1Notation(1, 1 + 5 * k);
  }

  if (num_acc < 5) {
    sheetTTT.deleteColumns(6 + 5 * num_acc, 5 * (5 - num_acc));
  }
  SpreadsheetApp.flush();

  const list_format = [];
  list_format[0] = rollA1Notation(5, 3, 400, 1);
  for (k = 1; k <= num_acc; k++) {
    list_format[k] = rollA1Notation(5, 8 + 5 * k, 400, 1);
  }

  for (i = 0; i < 12; i++) {
    sheet = spreadsheet.insertSheet(MONTH_NAME.short[i], 3 + i, { template: sheetTTT });
    sheets[i] = sheet;

    sheet.getRange('A3').setFormula('CONCAT("Expenses "; TO_TEXT(_Backstage!$B' + (4 + h_ * i) + '))');

    ranges = [];
    for (k = 0; k < num_acc; k++) {
      ranges[k] = sheet.getRange(5, 1 + 5 * k, 400, 4);

      formula = 'CONCAT("Balance "; TO_TEXT(_Backstage!' + rollA1Notation(3 + h_ * i, 7 + w_ * k) + '))';
      testBuild = formulaBuild.balance(k, i);
      if (formula !== testBuild) ConsoleLog.warn('Formula build failed: FormulaBuild.ttt().header().balance()');
      sheet.getRange(2, 6 + 5 * k).setFormula(formula);

      formula = 'CONCAT("Expenses "; TO_TEXT(_Backstage!' + rollA1Notation(4 + h_ * i, 7 + w_ * k) + '))';
      testBuild = formulaBuild.expenses(k, i);
      if (formula !== testBuild) ConsoleLog.warn('Formula build failed: FormulaBuild.ttt().header().expenses()');
      sheet.getRange(3, 6 + 5 * k).setFormula(formula);

      expr1 = 'TEXT(_Backstage!' + rollA1Notation(2 + h_ * i, 8 + w_ * k) + '; "' + SETUP_SETTINGS.number_format + '")';
      expr1 = '"Withdrawal: ["; _Backstage!' + rollA1Notation(2 + h_ * i, 9 + w_ * k) + '; "] "; ' + expr1 + '; "\n"; ';

      expr2 = 'TEXT(_Backstage!' + rollA1Notation(3 + h_ * i, 8 + w_ * k) + '; "' + SETUP_SETTINGS.number_format + '")';
      expr2 = '"Deposit: ["; _Backstage!' + rollA1Notation(3 + h_ * i, 9 + w_ * k) + '; "] "; ' + expr2 + '; "\n"; ';

      expr3 = 'TEXT(_Backstage!' + rollA1Notation(4 + h_ * i, 8 + w_ * k) + '; "' + SETUP_SETTINGS.number_format + '")';
      expr3 = '"Trf. in: ["; _Backstage!' + rollA1Notation(4 + h_ * i, 9 + w_ * k) + '; "] "; ' + expr3 + '; "\n"; ';

      expr4 = 'TEXT(_Backstage!' + rollA1Notation(5 + h_ * i, 8 + w_ * k) + '; "' + SETUP_SETTINGS.number_format + '")';
      expr4 = '"Trf. out: ["; _Backstage!' + rollA1Notation(5 + h_ * i, 9 + w_ * k) + '; "] "; ' + expr4;

      formula = 'CONCATENATE(' + expr1 + expr2 + expr3 + expr4 + ')';

      testBuild = formulaBuild.report(k, i);
      if (formula !== testBuild) ConsoleLog.warn('Formula build failed: FormulaBuild.ttt().header().report()');
      sheet.getRange(1, 8 + 5 * k).setFormula(formula);
    }

    if (SETUP_SETTINGS.decimal_places !== 2) {
      sheet.getRangeList(list_format).setNumberFormat(SETUP_SETTINGS.number_format);
    }

    ranges[k] = sheet.getRange(5, 1 + 5 * k, 400, 4);
    sheet.protect()
      .setUnprotectedRanges(ranges)
      .setWarningOnly(true);
  }

  sheets[0].getRange(1, 1).setValue('Wallet');
  for (k = 0; k < num_acc; k++) {
    sheets[0].getRange(1, 6 + k * 5).setValue(list_acc[k]);
  }

  for (i = 1; i < 12; i++) {
    for (k = 0; k < 1 + num_acc; k++) {
      sheets[i].getRange(1, 1 + 5 * k).setFormula('=' + MONTH_NAME.short[i - 1] + '!' + headers[k]);
    }
  }

  spreadsheet.deleteSheet(sheetTTT);
}
