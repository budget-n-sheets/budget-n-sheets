/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class BnsMaintenance {
  static fixSpreadsheet () {
    const financialYear = SettingsConst.get('financial_year')
    const yyyy = LocaleUtils.getDate().getFullYear()

    if (yyyy < financialYear) {
      return this
    } else if (yyyy > financialYear) {
      BnsSpreadsheet.showMonths()
      BnsSpreadsheet.resetMonthsColoring()
    } else {
      SpreadsheetMaintenance.hideShowMonths()
      SpreadsheetMaintenance.setMonthsColoring()
    }

    return this
  }

  static formatLastMonth () {
    const financialYear = SettingsConst.get('financial_year')
    const date = LocaleUtils.getDate()
    const yyyy = date.getFullYear()

    let month = date.getMonth()

    if (yyyy < financialYear) return this
    else if (yyyy > financialYear) month = 0
    else if (month > 0) mm--

    const format = new FormatTableTtt(month)
    format.indexes = 0
    format.format()

    return this
  }
}
