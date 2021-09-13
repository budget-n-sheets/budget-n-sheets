class RefreshCashFlow {
  constructor () {
    this.sheet = Spreadsheet2.getSheetByName('Cash Flow');
  }

  static isCompatible (sheet) {
    const name = sheet.getName();

    if (name === 'Cash Flow') return true;
    return Consts.month_name.short.indexOf(name) > -1;
  }

  static showWarning () {
    SpreadsheetApp2.getUi().alert(
      "Can't refresh cash flow",
      'Select a month or Cash Flow to refresh the flow.',
      SpreadsheetApp2.getUi().ButtonSet.OK);
  }
}
