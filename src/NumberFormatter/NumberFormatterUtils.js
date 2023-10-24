/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class NumberFormatterUtils {
  static get decP () {
    return SettingsSpreadsheet.get('decimal_places')
  }

  static getCurrencyRegExp () {
    const n = this.decP
    const dec_s = SettingsSpreadsheet.get('decimal_separator');
    return new RegExp('-?\\$ ?\\d+' + (n > 0 ? (dec_s ? '\\.' : ',') + '\\d{' + n + '}' : ''));
  }

  static getDecimalPlaceholder () {
    const n = this.decP
    return (n === 0 ? '0' : `0.${'0'.repeat(n)}`)
  }

  static getDecimalStep () {
    const n = this.decP
    return (n === 0 ? '1' : `0.${'0'.repeat(n - 1)}1`)
  }

  static getNumberFormat (ts = true) {
    const n = this.decP
    return `${ts ? '#,##' : ''}0${n === 0 ? '' : '.' + '0'.repeat(n)}`
  }

  static getFinancialFormat () {
    const f = this.getNumberFormat()
    return `${f};(${f})`
  }
}
