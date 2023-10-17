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
    const sheet = this.sheet
    const _w = TABLE_DIMENSION.width

    // TODO
    const db_accounts = new AccountsService().getAll()
    for (const id in db_accounts) {
      const account = db_accounts[id]
      this._sheet.getRange(1, 2 + _w + _w * account.index).setValue(`\^${account.name}\$`)
    }

    if (this._consts.numberAccounts < 5) {
      sheet.deleteColumns(7 + _w * this._consts.numberAccounts, _w * (5 - this._consts.numberAccounts))
    }

    sheet.getRange(
        2, 2,
        sheet.getMaxRows() - 1,
        sheet.getMaxColumns() - 1
      )
      .setNumberFormat(this._consts.numberFormat)

    sheet.protect().setWarningOnly(true)
    sheet.setTabColor('#cc0000').hideSheet()
  }

  make () {
    this.setFormat_()

    SpreadsheetApp.flush()
  }

  makeConfig () {
    const numberFormat = FormatNumberUtils.getNumberFormat()
    this._consts.numberFormat = `${numberFormat};(${numberFormat})`
    this._consts.numberAccounts = SettingsConst.get('number_accounts')

    return this
  }
}
