class ExtendedSheet {
  constructor (name) {
    this._sheet = SpreadsheetApp2.getActive().getSheetByName(name);
    if (!this._sheet) throw new Error('Sheet not found.');
  }
}
