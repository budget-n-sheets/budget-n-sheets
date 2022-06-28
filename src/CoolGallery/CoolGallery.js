class CoolGallery extends MirrorSheet {
  constructor (metadata) {
    super(metadata);
  }

  static getById (id) {
    switch (id) {
      case 'filter_by_tag':
        return new CoolFilterByTag();
      // case 'stats_for_tags':
      //   return new CoolStatsForTags();
      case 'tags_by_category':
        return new CoolTagsByCategory();

      default:
        console.error('CoolGallery: getById(): Switch case is default.', id);
        break;
    }
  }

  flush () {
    SpreadsheetApp.flush();
    this._spreadsheet.setActiveSheet(this.sheet);
    return this;
  }

  isSourceAvailable () {
    return SpreadsheetService.isSpreadsheetAvailable(this._metadata.id);
  }
}
