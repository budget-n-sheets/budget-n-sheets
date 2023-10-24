/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SpreadsheetSettings {
  static updateDecimalPlaces () {
    SheetAllMonths.resetNumberFormat()
    new SheetCashFlow().resetNumberFormat()
    new SheetBackstage().resetNumberFormat()
    new SheetSettings().resetNumberFormat()
    new SheetSummary().resetNumberFormat()
    new SheetTags().resetNumberFormat()
  }

  static updateDecimalSeparator () {
    const spreadsheet = SpreadsheetApp2.getActive().spreadsheet
    const decS = new SheetSettings().testDecimalSeparator()

    SettingsSpreadsheet.set('decimal_separator', decS)
      .set('spreadsheet_locale', spreadsheet.getSpreadsheetLocale())
      .updateMetadata()
  }
}
