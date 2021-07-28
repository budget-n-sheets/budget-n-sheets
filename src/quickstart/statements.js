const QUICKSTART_DATA_STATEMENTS = Object.freeze({
  1: [[7, 'Coffee shop', null, '']],
  2: [[7, 'Grocery shop', null, '']],
  3: [
    [7, 'Income (in cash), add #rct tag', null, '#rct', null,
      7, 'Income (via transfer #trf), add #rct tag', null, '#trf #rct'],
    [null, null, null, null, null,
      7, 'Income (via deposit #dp), add #rct tag', null, '#dp #rct']
  ],
  4: [
    [7, 'Pizza, my share', null, ''],
    [7, 'Pizza, others share (not accounted in expenses), add #ign tag', null, '#ign']
  ]
});

function playQuickStatements_ (n) {
  let lastRow, col, val;

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

  const data = QUICKSTART_DATA_STATEMENTS[n];
  if (!data) throw new Error("Values for quickstart example couldn't be found. statements " + n);

  switch (n) {
    case 1:
      col = 1;
      data[0][2] = randomValueNegative(2, 2);
      break;
    case 2:
      col = 6;
      data[0][2] = randomValueNegative(2, 2);
      break;
    case 3:
      col = 1;
      data[0][2] = randomValue(3, 2);
      data[0][7] = randomValue(3, 2);
      data[1][7] = randomValue(3, 2);
      break;
    case 4:
      val = -randomInteger(20);
      col = 1 + 5 * randomInteger(2);
      data[0][2] = val;
      data[1][2] = 3 * val;
      break;

    default:
      throw new Error('playQuickStatements_(): Switch case is default. ' + n);
  }

  if (sheet.getMaxRows() < lastRow + data.length) {
    toolPicker_('AddBlankRows', name);
  }

  sheet.getRange(lastRow + 1, col, data.length, data[0].length)
    .setValues(data)
    .activate();

  SpreadsheetApp.flush();
  fillMonthWithZeros(sheet);
}
