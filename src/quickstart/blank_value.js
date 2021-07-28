const QUICKSTART_DATA_BLANKVALUE = Object.freeze({
  1: [
    [5, 'Parking', null, '', null,
      5, 'Coffee shop', null, ''],
    [7, 'No transactions below are accounted for due\nto this blank value', '', '', null,
      7, 'Fill in the blank values with zeros', '', ''],
    [11, 'Book Store', null, '', null,
      '', '', '', ''],
    [13, 'Shopping', null, '', null,
      13, 'Deposit', null, '#dp'],
    [17, 'Parking', null, '', null,
      17, 'Transfer to Joe', null, '#trf']
  ],
  2: [
    [5, 'Some deposit', null, '#dp'],
    [7, 'Delete the value to peek the balance and\nexpenses before the following transactions\nUndo with Ctrl+z or ⌘+z', null, ''],
    [11, 'Some expenses', null, ''],
    [13, 'Some expenses', null, '']
  ]
});

function playQuickBlankValue_ (n) {
  let lastRow;

  const name = (SettingsConst.getValueOf('financial_year') === DATE_NOW.getFullYear() ? MONTH_NAME.short[DATE_NOW.getMonth()] : MONTH_NAME.short[0]);
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();

  const sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    alertQuickstartSheetMissing(name);
    return;
  }

  spreadsheet.setActiveSheet(sheet);
  lastRow = sheet.getLastRow();
  if (lastRow < 4) lastRow = 4;

  const data = QUICKSTART_DATA_BLANKVALUE[n];
  if (!data) throw new Error("Values for quickstart example couldn't be found. statements " + n);

  switch (n) {
    case 1:
      col = 1;
      data[0][2] = randomValueNegative(1, 2);
      data[0][7] = randomValueNegative(2, 2);

      data[2][2] = randomValueNegative(2, 2);

      data[3][2] = randomValueNegative(3, 2);
      data[3][7] = randomValue(4, 2);

      data[4][2] = randomValueNegative(2, 2);
      data[4][7] = randomValueNegative(3, 2);
      break;
    case 2:
      col = 6;
      data[0][2] = randomValue(4, 2);
      data[1][2] = randomValueNegative(2, 2);
      data[2][2] = randomValueNegative(2, 2);
      data[3][2] = randomValueNegative(2, 2);
      break;

    default:
      throw new Error('playQuickBlankValue_(): Switch case is default. ' + n);
  }

  if (sheet.getMaxRows() < lastRow + data.length) {
    toolPicker_('AddBlankRows', name);
  }

  if (n === 2) fillMonthWithZeros(sheet);

  sheet.getRange(lastRow + 1, col, data.length, data[0].length)
    .setValues(data)
    .activate();

  SpreadsheetApp.flush();
}
