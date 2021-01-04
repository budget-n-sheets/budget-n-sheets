function setupSettings_ (yyyy_mm) {
  const buildFormulas = FormulaBuild.settings().formulas();
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('_Settings');
  let cell, dec_p;

  spreadsheet.setActiveSheet(sheet);
  spreadsheet.moveActiveSheet(7);

  sheet.protect().setWarningOnly(true);

  dec_p = SETUP_SETTINGS.decimal_places;
  const dec_c = (dec_p > 0 ? '.' + '0'.repeat(dec_p) : '.0');

  cell = sheet.getRange(8, 2);
  cell.setNumberFormat('0' + dec_c);
  cell.setValue(0.1);
  SpreadsheetApp.flush();

  cell = cell.getDisplayValue();
  dec_p = /\./.test(cell);
  if (dec_p === 0) sheet.getRange(8, 2).setNumberFormat('0');

  SETUP_SETTINGS.decimal_separator = dec_p;

  cell = [
    ['=' + FormatNumber.localeSignal(SETUP_SETTINGS.financial_year)],
    [buildFormulas.actual_month()],
    ['=' + FormatNumber.localeSignal(SETUP_SETTINGS.init_month + 1)],
    [buildFormulas.active_months()],
    [buildFormulas.m_factor()],
    [buildFormulas.count_tags()],
    ['=RAND()']
  ];
  sheet.getRange(2, 2, 7, 1).setFormulas(cell);

  const metadata = {
    initial_month: SETUP_SETTINGS.init_month,
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
