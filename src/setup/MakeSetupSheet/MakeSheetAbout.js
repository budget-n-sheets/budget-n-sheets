/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class MakeSheetAbout extends MakeSetupSheet {
  constructor () {
    super('_About BnS')
  }

  make () {
    this.sheet.setTabColor('#6aa84f')
  }

  unpack () {
    this.sheet.hideSheet().protect().setWarningOnly(true)
    return this
  }
}
