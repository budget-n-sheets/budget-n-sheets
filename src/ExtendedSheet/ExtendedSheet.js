class ExtendedSheet {
  constructor (name) {
    this._sheet = Spreadsheet2.getSheetByName(name);
    if (!this._sheet) throw new Error('Sheet not found.');
  }
}
