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
    const depends = MakeSheetTags.depends
    super('Tags', depends)
  }

  static get depends () {
    return ['_Settings', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  }

  make () {
    new SheetTags().resetDefault()
    this.sheet.setTabColor('#e69138')
    SpreadsheetApp.flush()
  }

  unpack () {
    this.sheet.protect().setWarningOnly(true)
    return this
  }
}
