/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class MakeSheetTags extends MakeSheet {
  constructor () {
    const requires = MakeSheetTags.requires
    super('Tags', requires)
  }

  static get requires () {
    return ['_Settings', 'TTT']
  }

  make () {
    new SheetTags().resetDefault()
    this.sheet.setTabColor('#e69138')

    SpreadsheetApp.flush();
    this._spreadsheet.setActiveSheet(this.sheet);
  }

  makeConfig () {
    return this;
  }
}
