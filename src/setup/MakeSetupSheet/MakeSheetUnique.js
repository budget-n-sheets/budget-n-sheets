/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class MakeSheetUnique extends MakeSetupSheet {
  constructor () {
    const depends = MakeSheetUnique.depends
    super('_Unique', depends)
  }

  static get depends () {
    return ['Tags', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  }

  make () {
    new SheetUnique().resetDefault()
    this.sheet.setTabColor('#cc0000')
    SpreadsheetApp.flush()
  }

  unpack () {
    this.sheet.hideSheet().protect().setWarningOnly(true)
    return this
  }
}
