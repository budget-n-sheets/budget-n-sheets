class RapidAccessSpreadsheet {
  constructor (spreadsheet) {
    this._spreadsheet = spreadsheet;
  }

  get self () {
    return this._spreadsheet._self;
  }

  metadata () {
    return this._spreadsheet.metadata ||
          (this._spreadsheet.metadata = new Metadata());
  }

  sheets () {
    return this._spreadsheet.sheets;
  }
}
