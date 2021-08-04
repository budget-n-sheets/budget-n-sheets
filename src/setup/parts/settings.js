function setupSettings_ () {
  const setup_settings = CachedAccess.get('setup_settings');
  const buildFormulas = FormulaBuild.settings().formulas();
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('_Settings');
  let cell, dec_p;

  spreadsheet.setActiveSheet(sheet);
  spreadsheet.moveActiveSheet(8);

  sheet.protect().setWarningOnly(true);

  dec_p = setup_settings.decimal_places;
  const dec_c = (dec_p > 0 ? '.' + '0'.repeat(dec_p) : '.0');

  cell = sheet.getRange(8, 2);
  cell.setNumberFormat('0' + dec_c);
  cell.setValue(0.1);
  SpreadsheetApp.flush();

  cell = cell.getDisplayValue();
  dec_p = /\./.test(cell);
  if (dec_p === 0) sheet.getRange(8, 2).setNumberFormat('0');

  setup_settings.decimal_separator = dec_p;
  SettingsSpreadsheet.setValueOf('decimal_separator', dec_p);

  cell = [
    [FormatNumber.localeSignal(setup_settings.financial_year)],
    [buildFormulas.actualMonth()],
    [FormatNumber.localeSignal(setup_settings.init_month + 1)],
    [buildFormulas.activeMonths()],
    [buildFormulas.mFactor()],
    [buildFormulas.countTags()],
    ['RAND()'],
    [FormatNumber.localeSignal(setup_settings.decimal_places)],
    [setup_settings.decimal_separator],
    ['CONCATENATE("#,##0."; REPT("0"; B9); ";(#,##0."; REPT("0"; B9); ")")']
  ];
  sheet.getRange(2, 2, 10, 1).setFormulas(cell);

  const metadata = {
    initial_month: setup_settings.init_month,
    financial_calendar_sha256: '',
    post_day_events: false,
    cash_flow_events: false
  };

  sheet.addDeveloperMetadata(
    'user_settings',
    JSON.stringify(metadata),
    SpreadsheetApp.DeveloperMetadataVisibility.PROJECT
  );

  SpreadsheetApp.flush();
}
