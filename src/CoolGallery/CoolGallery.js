/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class CoolGallery extends MirrorSheet {
  constructor (metadata) {
    super(metadata);
  }

  static getById (id) {
    switch (id) {
      case 'filter_by_tag':
        return new CoolFilterByTag();
      case 'stats_for_tags':
        return new CoolStatsForTags();
      case 'tags_by_category':
        return new CoolTagsByCategory();

      default:
        console.error('CoolGallery: getById(): Switch case is default.', id);
        break;
    }
  }

  checkDependencies () {
    for (const name of this._metadata.requires) {
      if (!SpreadsheetApp2.getActive().getSheetByName(name)) return false;
    }
    return true;
  }

  flush () {
    SpreadsheetApp.flush();
    this._spreadsheet.setActiveSheet(this.sheet);
    return this;
  }

  meetRequirements () {
    this.fixDependencies();
  }

  isSourceAvailable () {
    try {
      SpreadsheetApp.openById(this._metadata.id);
    } catch (err) {
      return false;
    }
    return true;
  }
}
