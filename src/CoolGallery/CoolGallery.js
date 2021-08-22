class CoolGallery {
  constructor (metadata) {
    this._spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
    this._metadata = metadata;
  }

  static getById (id) {
    switch (id) {
      case 'filter_by_tag':
        return new CoolFilterByTag();
      case 'stats_for_tags':
        return new CoolStatsForTags();

      default:
        console.error('CoolGallery: getById(): Switch case is default.', id);
        break;
    }
  }

  copyTemplate () {
    SpreadsheetService.copySheetsFromSource(
      this._metadata.id,
      [this._metadata.sheet_name]
    );

    SpreadsheetApp.flush();
    return this;
  }

  deleteTemplate () {
    const sheet = this._spreadsheet.getSheetByName(this._metadata.sheet_name);
    if (sheet) this._spreadsheet.deleteSheet(sheet);

    SpreadsheetApp.flush();
    return this;
  }

  flush () {
    SpreadsheetApp.flush();
    this._spreadsheet.setActiveSheet(this._sheet);

    return this;
  }

  getName () {
    return this._metadata.name;
  }

  isAvailable () {
    return SpreadsheetService.isSpreadsheetAvailable(this._metadata.id);
  }

  isInstalled () {
    return !!this._spreadsheet.getSheetByName(this._metadata.sheet_name);
  }

  makeConfig () {
    this._sheets = [];
    this._sheets.push(this._spreadsheet.getSheetByName(this._metadata.sheet_name));

    this._sheet = this._sheets[0];

    return this;
  }
}
