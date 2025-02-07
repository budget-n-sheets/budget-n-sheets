/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class MakeSheetSummary extends MakeSetupSheet {
  constructor () {
    const depends = MakeSheetSummary.depends
    super('Summary', depends)
  }

  static get depends () {
    return ['_Settings', '_Backstage']
  }

  make () {
    new SheetSummary().resetDefault()
    this.sheet.setTabColor('#e69138')
    SpreadsheetApp.flush()
  }

  unpack () {
    this.sheet.protect().setWarningOnly(true)
    return this
  }
}
