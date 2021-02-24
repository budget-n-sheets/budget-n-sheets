function setupMonthSheet_ () {
  const formulaBuild = FormulaBuild.ttt().header();

  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  const sheetTTT = spreadsheet.getSheetByName('TTT');
  let sheet, formula;
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

  if (SETUP_SETTINGS.decimal_places !== 2) {
    const list_format = [];

    list_format[0] = rollA1Notation(5, 3, 400, 1);

    for (let k = 1; k <= num_acc; k++) {
      list_format[k] = rollA1Notation(5, 8 + 5 * k, 400, 1);
    }

    sheetTTT.getRangeList(list_format)
      .setNumberFormat(SETUP_SETTINGS.number_format);
  }

  SpreadsheetApp.flush();

  for (i = 0; i < 12; i++) {
    sheet = spreadsheet.insertSheet(MONTH_NAME.short[i], 3 + i, { template: sheetTTT });
    sheets[i] = sheet;

    sheet.getRange('A3').setFormula('CONCAT("Expenses "; TO_TEXT(_Backstage!$B' + (4 + h_ * i) + '))');

    const ranges = [];
    const rangeOff1 = sheet.getRange(2, 6);
    const rangeOff2 = sheet.getRange(5, 1, 400, 4);
    for (k = 0; k < num_acc; k++) {
      ranges[k] = rangeOff2.offset(0, 5 * k);

      formula = formulaBuild.balance(k, i);
      rangeOff1.offset(0, 5 * k).setFormula(formula);

      formula = formulaBuild.expenses(k, i);
      rangeOff1.offset(1, 5 * k).setFormula(formula);

      formula = formulaBuild.report(k, i);
      rangeOff1.offset(-1, 2 + 5 * k).setFormula(formula);
    }

    ranges[k] = rangeOff2.offset(0, 5 * k);
    sheet.protect()
      .setUnprotectedRanges(ranges)
      .setWarningOnly(true);
  }

  sheets[0].getRange(1, 1).setValue('Wallet');
  for (k = 0; k < num_acc; k++) {
    sheets[0].getRange(1, 6 + k * 5).setValue(list_acc[k]);
  }

  for (i = 1; i < 12; i++) {
    const rangeOff = sheets[i].getRange(1, 1);

    for (k = 0; k < 1 + num_acc; k++) {
      rangeOff.offset(0, 5 * k).setFormula('=' + MONTH_NAME.short[i - 1] + '!' + headers[k]);
    }
  }

  spreadsheet.deleteSheet(sheetTTT);
}
