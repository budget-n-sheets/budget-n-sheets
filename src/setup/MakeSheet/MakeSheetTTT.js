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
  constructor (mm) {
    const name = Consts.month_name.short[mm]
    const requires = ['_Backstage', '_Unique']
    super(name, requires, { name: 'TTT' })
  }

  make () {
    const spreadsheet = SpreadsheetApp2.getActive()

    for (let mm = 0; mm < 12; mm++) {
      const name = Consts.month_name.short[mm]
      if (spreadsheet.getSheetByName(name)) continue

      const sheet = this._spreadsheet.insertSheet(name, 1, { template: this.sheet })

      sheet.getRange('B1').setValue('Wallet')

      new SheetMonth(mm).resetFormulas()
        .resetProtection()
        .resetFilter()
        .resetConditionalFormat()
        .resetSelectors()
    }

    this._spreadsheet.deleteSheet(this.sheet)
    SpreadsheetApp.flush()
  }

  makeConfig () {
    const decP = SettingsSpreadsheet.get('decimal_places')
    if (decP !== 2) {
      const range = RangeUtils.rollA1Notation(6, 5, 400, 1)
      const numberFormat = FormatNumberUtils.getFinancialFormat()
      this.sheet
        .getRange(range)
        .setNumberFormat(numberFormat)
    }

    return this
  }
}
