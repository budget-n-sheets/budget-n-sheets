const QUICKSTART_DATA_TRANSACTIONS = Object.freeze({
  1: [[7, 'Deposit (to my account #dp)', null, '#dp']],
  2: [[7, 'Transfer (from someone #trf)', null, '#trf']],
  3: [[7, 'Transfer (to someone #trf)', null, '#trf']],
  4: [[7, 'Withdrawal (cash dispenser #wd)', null, '#wd']]
});

function playQuickTransactions_ (n) {
  const data = QUICKSTART_DATA_TRANSACTIONS[n];
  if (!data) throw new Error("Values for quickstart example couldn't be found. transactions " + n);

  switch (n) {
    case 1:
      data[0][2] = Noise.randomValue(3, 2);
      break;
    case 2:
      data[0][2] = Noise.randomValue(3, 2);
      break;
    case 3:
      data[0][2] = Noise.randomValueNegative(3, 2);
      break;
    case 4:
      data[0][2] = Noise.randomValueNegative(3, 2);
      break;

    default:
      throw new Error('playQuickTransactions_(): Switch case is default. ' + n);
  }

  const name = (SettingsConst.getValueOf('financial_year') === Consts.date.getFullYear() ? Consts.month_name.short[Consts.date.getMonth()] : Consts.month_name.short[0]);
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    alertQuickstartSheetMissing(name);
    return;
  }

  spreadsheet.setActiveSheet(sheet);
  let lastRow = sheet.getLastRow();
  if (lastRow < 4) lastRow = 4;

  new ToolInsertRowsMonth(sheet).insertRowsTo(data.length);
  sheet.getRange(lastRow + 1, 6, data.length, data[0].length)
    .setValues(data)
    .activate();

  SpreadsheetApp.flush();
  fillMonthWithZeros(sheet);
}
