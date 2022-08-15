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
