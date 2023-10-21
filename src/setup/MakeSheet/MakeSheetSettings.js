/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class MakeSheetSettings extends MakeSheet {
  constructor () {
    const depends = MakeSheetSettings.depends
    super('_Settings', depends)
  }

  static get depends () {
    return ['Tags']
  }

  make () {
    new SheetSettings().resetDefault()
    this.sheet.setTabColor('#cc0000').hideSheet()
    SpreadsheetApp.flush()
  }

  unpack () {
    this.sheet.protect().setWarningOnly(true)
    return this
  }
}
