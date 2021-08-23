function playQuickCashFlow_ (n) {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  let sheet;

  const mm = (SettingsConst.getValueOf('financial_year') === Consts.date.getFullYear() ? Consts.date.getMonth() : 0);

  sheet = spreadsheet.getSheetByName('Cash Flow');
  if (!sheet) {
    alertQuickstartSheetMissing('Cash Flow');
    return;
  }
  sheet.getRange(1, 2 + 4 * mm, 1, 3).activate();

  sheet = spreadsheet.getSheetByName(Consts.month_name.short[mm]);
  if (!sheet) {
    alertQuickstartSheetMissing(Consts.month_name.short[mm]);
    return;
  }

  fillMonthWithZeros(sheet);
  updateCashFlow_(mm);
}
