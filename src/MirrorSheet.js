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
  constructor (name, requires, template) {
    this._template = {}
    Object.assign(this._template, template)

    this._name = name
    this._requires = requires
  }

  get name () {
    return this._name;
  }

  get sheet () {
    return this._sheet ||
          (this._sheet = SpreadsheetApp2.getActive().getSheetByName(this._name));
  }

  copyTemplate () {
    const source = SpreadsheetApp.openById(this._template.id);
    SpreadsheetApp2.getActive().copySheetsFrom(source, [this._name]);
    SpreadsheetApp.flush();
    return this;
  }

  deleteTemplate () {
    const sheet = SpreadsheetApp2.getActive().getSheetByName(this._name);
    if (sheet) SpreadsheetApp2.getActive().deleteSheet(this.sheet);
    this._sheet = null;
    SpreadsheetApp.flush();
    return this;
  }

  isInstalled () {
    return this.sheet != null;
  }
}
