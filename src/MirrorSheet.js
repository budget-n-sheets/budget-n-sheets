/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class MirrorSheet {
  constructor (metadata) {
    this._spreadsheet = SpreadsheetApp3.getActive();
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
          (this._sheet = Spreadsheet3.getSheetByName(this.name));
  }

  copyTemplate () {
    SpreadsheetService.copySheetsFromSource(this._metadata.id, [this.name]);
    SpreadsheetApp.flush();
    return this;
  }

  deleteTemplate () {
    const sheet = Spreadsheet3.getSheetByName(this.name);
    if (sheet) this._spreadsheet.deleteSheet(this.sheet);
    this._sheet = null;
    SpreadsheetApp.flush();
    return this;
  }

  isInstalled () {
    return this.sheet != null;
  }
}
