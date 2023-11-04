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
  constructor (name, depends, template) {
    this._template = {
      id: template.id,
      name: template.name
    }

    this._name = name
    this._depends = depends
  }

  get depends () {
    return this._depends
  }

  get name () {
    return this._name
  }

  get sheet () {
    return this._sheet ||
          (this._sheet = SpreadsheetApp2.getActive().getSheetByName(this._name))
  }

  copyTemplate () {
    const source = SpreadsheetApp2.openById(this._template.id).spreadsheet
    const name = this._template.name || this._name
    SpreadsheetApp2.getActive().copySheetFrom(source, name, this._name)
    SpreadsheetApp.flush()
    return this
  }

  deleteTemplate () {
    const spreadsheet = SpreadsheetApp2.getActive()
    const sheet = spreadsheet.getSheetByName(this._name)
    if (sheet) spreadsheet.deleteSheet(sheet)
    this._sheet = null
    SpreadsheetApp.flush()
    return this
  }
}
