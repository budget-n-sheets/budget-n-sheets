function setupCards_ () {
  const setup_settings = CachedAccess.get('setup_settings');
  const formulasCards = FormulaBuild.cards().header();

  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('Cards');
  let formula;
  let expr1, expr2, expr3;
  let i, k;

  const h_ = TABLE_DIMENSION.height;
  const w_ = TABLE_DIMENSION.width;

  const dec_p = setup_settings.decimal_separator;
  const num_acc = setup_settings.number_accounts;

  const col = 2 + w_ + w_ * num_acc;
  const dec_c = (dec_p ? ',' : '\\');
  const header = RangeUtils.rollA1Notation(1, col, 1, w_ * 11);

  spreadsheet.setActiveSheet(sheet);
  spreadsheet.moveActiveSheet(14);

  const ranges = [
    sheet.getRange(6, 1, 400, 5),
    sheet.getRange(2, 2, 1, 2)
  ];
  for (i = 1; i < 12; i++) {
    ranges[2 * i] = ranges[0].offset(0, 6 * i);
    ranges[2 * i + 1] = ranges[1].offset(0, 6 * i);
  }

  sheet.protect()
    .setUnprotectedRanges(ranges)
    .setWarningOnly(true);

  const rangeOff = sheet.getRange(2, 1);
  for (i = 0; i < 12; i++) {
    const index = RangeUtils.rollA1Notation(2, 1 + 6 * i);
    const card = RangeUtils.rollA1Notation(2, 2 + 6 * i);
    const reference = '_Backstage!' + RangeUtils.rollA1Notation(2 + h_ * i, col);

    rangeOff.offset(0, 1 + 6 * i).setValue('All');

    formula = formulasCards.availCredit(i, reference);
    rangeOff.offset(1, 6 * i).setFormula(formula);

    formula = formulasCards.sparkline(index, card, reference);
    rangeOff.offset(2, 6 * i).setFormula(formula);

    formula = formulasCards.index(card, header);
    rangeOff.offset(0, 6 * i).setFormula(formula);

    formula = formulasCards.report(index, reference);
    rangeOff.offset(0, 3 + 6 * i).setFormula(formula);
  }

  if (setup_settings.decimal_places !== 2) {
    const list_format = [];

    for (let i = 0; i < 12; i++) {
      list_format[i] = RangeUtils.rollA1Notation(6, 4 + 6 * i, 400, 1);
    }

    sheet.getRangeList(list_format).setNumberFormat(setup_settings.number_format);
  }

  SpreadsheetApp.flush();
}
