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
    super(MakeSheetBackstage.metadata)
  }

  static get metadata () {
    return {
      name: '_Backstage',
      requires: ['TTT']
    }
  }

  setFormat_ () {
    const _w = TABLE_DIMENSION.width

    if (this._consts.numberAccounts < 5) {
      this.sheet
        .deleteColumns(
          7 + _w * this._consts.numberAccounts,
          _w * (5 - this._consts.numberAccounts))
    }
  }

  make () {
    this.setFormat_()
    RecalculationService.resume(0, 12)
    new SheetBackstage().resetGroupData().resetDefault()

    SpreadsheetApp.flush()
  }

  makeConfig () {
    this._consts.numberAccounts = SettingsConst.get('number_accounts')
    return this
  }
}
