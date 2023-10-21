/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class MakeSheetCashFlow extends MakeSheet {
  constructor () {
    const requires = MakeSheetCashFlow.requires
    super('Cash Flow', requires)
  }

  static get requires () {
    return ['_Backstage']
  }

  make () {
    new SheetCashFlow().resetWeekendColoring()
      .resetFormulas()
      .resetDefault()
    SpreadsheetApp.flush()
  }

  makeConfig () {
    return this
  }
}
