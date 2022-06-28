class CoolGallery {
  constructor (metadata) {
    this._spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
    this._metadata = metadata;
  }

  static getById (id) {
    switch (id) {
      case 'filter_by_tag':
        return new CoolFilterByTag();
      // case 'stats_for_tags':
      //   return new CoolStatsForTags();

      default:
        console.error('CoolGallery: getById(): Switch case is default.', id);
        break;
    }
  }

  get metadata () {
    return this._metadata;
  }

  get name () {
    return this._metadata.name;
  }

  copyTemplate () {
    SpreadsheetService.copySheetsFromSource(this._metadata.template_id, this._metadata.sheets);
    SpreadsheetApp.flush();
    return this;
  }

  deleteTemplate () {
    for (const name of this._metadata.sheets) {
      const sheet = this._spreadsheet.getSheetByName(name);
      if (sheet) this._spreadsheet.deleteSheet(sheet);
    }
    SpreadsheetApp.flush();
    return this;
  }

  flush () {
    SpreadsheetApp.flush();
    this._spreadsheet.setActiveSheet(this._sheet);
    return this;
  }

  isSourceAvailable () {
    return SpreadsheetService.isSpreadsheetAvailable(this._metadata.template_id);
  }

  isInstalled () {
    for (const name of this._metadata.sheets) {
      if (this._spreadsheet.getSheetByName(name)) return true;
    }
    return false;
  }
}
