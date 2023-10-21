/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class MakeSheetUnique extends MakeSheet {
  constructor () {
    const depends = MakeSheetUnique.depends
    super('_Unique', depends)
  }

  static get depends () {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  }

  make () {
    new SheetUnique().resetDefault()
    SpreadsheetApp.flush()
  }

  unpack () {
    return this
  }
}
