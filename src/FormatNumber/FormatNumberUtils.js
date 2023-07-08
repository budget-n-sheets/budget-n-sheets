/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class FormatNumberUtils {
  static getCurrencyRegExp () {
    const dec_p = SettingsSpreadsheet.get('decimal_places');
    const dec_s = SettingsSpreadsheet.get('decimal_separator');
    return new RegExp('-?\\$ ?\\d+' + (dec_p > 0 ? (dec_s ? '\\.' : ',') + '\\d{' + dec_p + '}' : ''));
  }

  static getNumberFormat () {
    const dec_p = SettingsSpreadsheet.get('decimal_places');
    const mantissa = (dec_p > 0 ? '.' + '0'.repeat(dec_p) : '');
    return '#,##0' + mantissa;
  }
}
