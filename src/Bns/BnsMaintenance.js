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
  static fixNumberFormat () {
    SpreadsheetSettings.updateDecimalSeparator()
    SpreadsheetSettings.updateDecimalPlaces()
    return this
  }

  static fixProtection () {
    new SheetBackstage().resetProtection()
    new SheetCashFlow().resetProtection()
    SheetAllMonths.resetProtection()
    new SheetSettings().resetProtection()
    new SheetSummary().resetProtection()
    new SheetTags().resetProtection()
    new SheetUnique().resetProtection()
  }

  static fixSuggestions () {
    new SheetUnique().resetFormulas()
    SheetAllMonths.resetSelectors()
  }

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
    else if (month > 0) month--

    month = Consts.month_name.short[month]
    month = SpreadsheetApp2.getActive().getSheetByName(month)
    FormatTableMonth.format(month)

    return this
  }
}
