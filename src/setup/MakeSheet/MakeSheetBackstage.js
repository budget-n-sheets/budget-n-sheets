/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class MakeSheetBackstage extends MakeSheet {
  constructor () {
    const depends = MakeSheetBackstage.depends
    super('_Backstage', depends)
  }

  static get depends () {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  }

  make () {
    RecalculationService.resume(0, 12)
    new SheetBackstage().resetGroupData().resetDefault()

    SpreadsheetApp.flush()
  }

  unpack () {
    const numberAccounts = SettingsConst.get('number_accounts')
    const _w = TABLE_DIMENSION.width

    if (numberAccounts < 5) {
      this.sheet.deleteColumns(
        7 + _w * numberAccounts,
        _w * (5 - numberAccounts))
    }
    return this
  }
}
