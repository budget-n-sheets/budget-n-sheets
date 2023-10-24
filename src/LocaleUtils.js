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

  static getNumberDecimalSeparator () {
    return this.decS ? '.' : ','
  }

  static getNumberKSeparator () {
    return this.decS ? ',' : '.'
  }
}
