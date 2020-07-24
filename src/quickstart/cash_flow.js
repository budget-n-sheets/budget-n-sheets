function playQuickCashFlow_ (n) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet;

  const mm = (getConstProperties_('financial_year') === DATE_NOW.getFullYear() ? DATE_NOW.getMonth() : 0);

  sheet = spreadsheet.getSheetByName('Cash Flow');
  if (!sheet) {
    alertQuickstartSheetMissing('Cash Flow');
    return;
  }
  sheet.getRange(1, 2 + 4 * mm, 1, 3).activate();

  sheet = spreadsheet.getSheetByName(MN_SHORT[mm]);
  if (!sheet) {
    alertQuickstartSheetMissing(MN_SHORT[mm]);
    return;
  }

  fillMonthWithZeros(sheet);
  updateCashFlow_(mm);
}
