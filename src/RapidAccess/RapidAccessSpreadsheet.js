class RapidAccessSpreadsheet {
  constructor (spreadsheet) {
    this._spreadsheet = spreadsheet;
  }

  sheets () {
    return this._spreadsheet.sheets;
  }
}
