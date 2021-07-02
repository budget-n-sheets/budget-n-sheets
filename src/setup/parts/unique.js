function setupUnique_ () {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('_Unique');

  const num_acc = SETUP_SETTINGS.number_accounts;

  spreadsheet.setActiveSheet(sheet);
  spreadsheet.moveActiveSheet(20);

  sheet.protect().setWarningOnly(true);

  let range_accounts = '';
  let range_cards = '';

  const ranges = [];
  for (let k = 0; k <= num_acc; k++) {
    ranges[k] = rollA1Notation(5, 2 + 5 * k, 400, 1);
  }

  for (let i = 0 ; i < 12; i++) {
    range_cards += 'Cards!' + rollA1Notation(6, 2 + 6 * i, 400, 1) + '; ';

    for (let k = 0; k <= num_acc; k++) {
      range_accounts += MONTH_NAME.short[i] + '!' + ranges[k] + '; ';
    }
  }

  range_accounts = '{' + range_accounts.slice(0, -2) + '}';
  range_cards = '{' + range_cards.slice(0, -2) + '}';

  sheet.getRange(1, 1).setFormula('SORT(UNIQUE(' + range_accounts + '))');
  sheet.getRange(1, 2).setFormula('SORT(UNIQUE(' + range_cards + '))');

  SpreadsheetApp.flush();
}
