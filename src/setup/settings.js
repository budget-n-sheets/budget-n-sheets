function setupSettings_ (yyyy_mm) {
  const sheet = SPREADSHEET.getSheetByName('_Settings');
  let cell, dec_p;

  SPREADSHEET.setActiveSheet(sheet);
  SPREADSHEET.moveActiveSheet(7);

  sheet.protect().setWarningOnly(true);

  dec_p = SETUP_SETTINGS.decimal_places;
  const dec_c = (dec_p > 0 ? '.' + '0'.repeat(dec_p) : '');

  cell = sheet.getRange(8, 2);
  cell.setNumberFormat('0' + dec_c);
  cell.setValue(0.1);
  SpreadsheetApp.flush();

  cell = cell.getDisplayValue();
  dec_p = /\./.test(cell);

  SETUP_SETTINGS.decimal_separator = dec_p;

  cell = [
    ['=' + numberFormatLocaleSignal.call(SETUP_SETTINGS.financial_year, dec_p)],
    ['=IF(YEAR(TODAY()) = $B2; MONTH(TODAY()); IF(YEAR(TODAY()) < $B2; 0; 12))'],
    ['=' + numberFormatLocaleSignal.call(SETUP_SETTINGS.init_month + 1, dec_p)],
    ['=IF($B4 > $B3; 0; $B3 - $B4 + 1)'],
    ['=IF(AND($B3 = 12; YEAR(TODAY()) <> $B2); $B5; MAX($B5 - 1; 0))'],
    ["=COUNTIF(\'Tags\'!$E1:$E; \"<>\") - 1"],
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
