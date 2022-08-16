class MirrorSheet {
  constructor (metadata) {
    this._spreadsheet = SpreadsheetApp2.getActive();
    this._metadata = metadata;

    this._consts = {};
    this._settings = {};
  }

  get metadata () {
    return this._metadata;
  }

  get name () {
    return this._metadata.name;
  }

  get sheet () {
    return this._sheet ||
          (this._sheet = Spreadsheet2.getSheetByName(this.name));
  }

  copyTemplate () {
    SpreadsheetService.copySheetsFromSource(this._metadata.id, [this.name]);
    SpreadsheetApp.flush();
    return this;
  }

  deleteTemplate () {
    const sheet = Spreadsheet2.getSheetByName(this.name);
    if (sheet) this._spreadsheet.deleteSheet(this.sheet);
    this._sheet = null;
    SpreadsheetApp.flush();
    return this;
  }

  isInstalled () {
    return this.sheet != null;
  }
}
