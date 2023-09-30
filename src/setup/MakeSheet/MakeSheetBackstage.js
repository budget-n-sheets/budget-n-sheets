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
      id: Info.template.id,
      name: '_Backstage',
      requires: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    }
  }

  setFormat_ () {
    const sheet = this.sheet
    const _w = TABLE_DIMENSION.width

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
