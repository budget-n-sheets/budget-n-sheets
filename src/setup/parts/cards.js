function setupCards_ () {
  const formulasCards = FormulaBuild.cards().header();

  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('Cards');
  let formula;
  let expr1, expr2, expr3;
  let i, k;

  const h_ = TABLE_DIMENSION.height;
  const w_ = TABLE_DIMENSION.width;

  const dec_p = SETUP_SETTINGS.decimal_separator;
  const num_acc = SETUP_SETTINGS.number_accounts;

  const col = 2 + w_ + w_ * num_acc;
  const dec_c = (dec_p ? ',' : '\\');
  const header = rollA1Notation(1, col, 1, w_ * 11);

  spreadsheet.setActiveSheet(sheet);
  spreadsheet.moveActiveSheet(14);

  const ranges = [];
  for (i = 0; i < 12; i++) {
    ranges[2 * i] = sheet.getRange(6, 1 + 6 * i, 400, 5);
    ranges[2 * i + 1] = sheet.getRange(2, 2 + 6 * i, 1, 2);
  }

  sheet.protect()
    .setUnprotectedRanges(ranges)
    .setWarningOnly(true);

  for (i = 0; i < 12; i++) {
    const index = rollA1Notation(2, 1 + 6 * i);
    const card = rollA1Notation(2, 2 + 6 * i);
    const reference = '_Backstage!' + rollA1Notation(2 + h_ * i, col);

    sheet.getRange(2, 2 + 6 * i).setValue('All');

    formula = formulasCards.avail_credit(i, reference);
    sheet.getRange(3, 1 + 6 * i).setFormula(formula);

    formula = formulasCards.sparkline(index, card, reference);
    sheet.getRange(4, 1 + 6 * i).setFormula(formula);

    formula = formulasCards.index(card, header);
    sheet.getRange(2, 1 + 6 * i).setFormula(formula);

    formula = formulasCards.report(index, reference);
    sheet.getRange(2, 4 + 6 * i).setFormula(formula);
  }

  if (SETUP_SETTINGS.decimal_places !== 2) {
    const list_format = [];

    for (let i = 0; i < 12; i++) {
      list_format[i] = rollA1Notation(6, 4 + 6 * i, 400, 1);
    }

    sheet.getRangeList(list_format).setNumberFormat(SETUP_SETTINGS.number_format);
  }

  SpreadsheetApp.flush();
}
