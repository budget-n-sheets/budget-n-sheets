function setupTags_ () {
  const setup_settings = CachedAccess.get('setup_settings');
  const formulaBuild = FormulaBuild.tags();

  const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('Tags');
  let formula, rg, cd;
  let i, k;

  const h_ = TABLE_DIMENSION.height;
  const w_ = TABLE_DIMENSION.width;

  const tags = ['D5:D404', 'I5:I404', 'N5:N404', 'S5:S404', 'X5:X404', 'AC5:AC404'];
  const combo = ['C5:D404', 'H5:I404', 'M5:N404', 'R5:S404', 'W5:X404', 'AB5:AC404'];

  const num_acc = setup_settings.number_accounts;

  const formulas = [[]];
  const col = 11 + w_ * num_acc;

  const ranges = sheet.getRange(2, 1, 40, 5);
  sheet.protect()
    .setUnprotectedRanges([ranges])
    .setWarningOnly(true);

  const buildMonths = formulaBuild.table();

  for (i = 0; i < 12; i++) {
    formula = buildMonths.month(400, 400, i);
    formulas[0][i] = formula;
  }
  sheet.getRange(1, 6, 1, 12).setFormulas(formulas);

  const buildStats = formulaBuild.stats();

  formula = buildStats.average();
  sheet.getRange(1, 19).setFormula(formula);

  formula = buildStats.total();
  sheet.getRange(1, 20).setFormula(formula);

  if (setup_settings.decimal_places !== 2) {
    sheet.getRange(2, 6, 40, 12).setNumberFormat(setup_settings.number_format);
    sheet.getRange(2, 19, 40, 2).setNumberFormat(setup_settings.number_format);
  }

  SpreadsheetApp.flush();
}
