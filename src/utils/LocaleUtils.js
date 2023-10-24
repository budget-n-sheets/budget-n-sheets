/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class LocaleUtils {
  static get decS () {
    return SettingsSpreadsheet.get('decimal_separator')
  }

  static getArrayColumnSeparator () {
    return this.decS ? ',' : '\\'
  }

  static getDate (date) {
    let timezone = SpreadsheetApp2.getActive().spreadsheet.getSpreadsheetTimeZone()
    if (typeof timezone !== 'string' || timezone === '') timezone = 'GMT'

    const formatDate = Utilities.formatDate(date || Consts.date, timezone, "yyyy-MM-dd'T'HH:mm:ss'Z'")

    return new Date(formatDate)
  }

  static getDateOffset () {
    return LocaleUtils.getDate() - Consts.date
  }

  static getNumberDecimalSeparator () {
    return this.decS ? '.' : ','
  }

  static getNumberKSeparator () {
    return this.decS ? ',' : '.'
  }
}
