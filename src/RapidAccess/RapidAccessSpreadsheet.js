class RapidAccessSpreadsheet {
  constructor (spreadsheet) {
    this._spreadsheet = spreadsheet;
  }

  get self () {
    return this._spreadsheet._self;
  }

  sheets () {
    return this._spreadsheet.sheets;
  }
}
