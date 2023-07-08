/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class MirrorSheet {
  constructor (metadata) {
    this._spreadsheet = SpreadsheetApp2.getActive().spreadsheet;
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
          (this._sheet = SpreadsheetApp2.getActive().getSheetByName(this.name));
  }

  copyTemplate () {
    const source = SpreadsheetApp.openById(this._metadata.id);
    SpreadsheetApp2.getActive().copySheetsFrom(source, [this.name]);
    SpreadsheetApp.flush();
    return this;
  }

  deleteTemplate () {
    const sheet = SpreadsheetApp2.getActive().getSheetByName(this.name);
    if (sheet) this._spreadsheet.deleteSheet(this.sheet);
    this._sheet = null;
    SpreadsheetApp.flush();
    return this;
  }

  isInstalled () {
    return this.sheet != null;
  }
}
