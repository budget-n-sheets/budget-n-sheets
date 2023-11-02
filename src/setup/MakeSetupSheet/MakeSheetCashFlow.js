/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class MakeSheetCashFlow extends MakeSetupSheet {
  constructor () {
    super('Cash Flow')
  }

  make () {
    new SheetCashFlow().resetWeekendColoring()
      .resetFormulas()
      .resetDefault()
    this.sheet.setTabColor('#e69138')
    SpreadsheetApp.flush()
  }

  unpack () {
    this.sheet.protect().setWarningOnly(true)
    return this
  }
}
