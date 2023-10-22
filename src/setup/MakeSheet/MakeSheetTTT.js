/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class MakeSheetTTT extends MakeSheet {
  constructor (name) {
    const mm = Consts.month_name.short.indexOf(name)
    if (mm === -1) throw new Error('Invalid month name.')

    const depends = MakeSheetTTT.depends
    if (mm > 0) depends.push(Consts.month_name.short[mm - 1])
    super(name, depends, { name: 'TTT' })

    this._mm = mm
  }

  static get depends () {
    return ['_Backstage', '_Unique']
  }

  make () {
    this.sheet
      .getRange('B1')
      .setValue('Wallet')

    new SheetMonth(this._mm).resetProtection()
      .resetFormulas()
      .resetFilter()
      .resetSelectors()

    SpreadsheetApp.flush()
  }

  unpack () {
    const initialMonth = SettingsUser.get('initial_month')
    const tabColor = this._mm < initialMonth ? '#b7b7b7' : '#a4c2f4'
    const decP = SettingsSpreadsheet.get('decimal_places')

    if (decP !== 2) {
      const numberFormat = FormatNumberUtils.getFinancialFormat()
      const specs = SheetMonth.specs
      const numRows = 400 // this.sheet.getMaxRows() - specs.row + 1
      this.sheet
        .getRange(
          specs.row, 4 + specs.columnOffset,
          numRows, 1)
        .setNumberFormat(numberFormat)
    }

    this.sheet
      .setTabColor(tabColor)
      .protect()
      .setWarningOnly(true)

    return this
  }
}
