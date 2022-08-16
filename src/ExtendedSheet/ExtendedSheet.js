class ExtendedSheet {
  constructor (name) {
    this._sheet = Spreadsheet3.getSheetByName(name);
    if (!this._sheet) throw new Error('Sheet not found.');
  }
}
