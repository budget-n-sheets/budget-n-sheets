class Spreadsheet2 {
  constructor () {
    this.spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
    this.sheets = RapidAccess.spreadsheet().sheets();
  }

  getSheetByName (name) {
    return this.sheets[name] ||
          (this.sheets[name] = this.spreadsheet.getSheetByName(name));
  }
}
