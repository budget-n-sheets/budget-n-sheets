class Utils {
  static getLocaleDate (date) {
    let timezone = SpreadsheetApp2.getActiveSpreadsheet().getSpreadsheetTimeZone();
    if (typeof timezone !== 'string' || timezone === '') timezone = 'GMT';

    const formatDate = Utilities.formatDate(date || DATE_NOW, timezone, "yyyy-MM-dd'T'HH:mm:ss'Z'");

    return new Date(formatDate);
  }

  static getMonthDelta (mm) {
    if (mm == null) mm = this.getLocaleDate().getMonth();

    switch (mm) {
      case 0:
        return [0, 3];
      case 1:
        return [-1, 2];
      case 11:
        return [-3, 0];

      default:
        return [-2, 1];
    }
  }

  static getTranslation (description) {
    const translation = { type: '', number: 0, signal: 1 };

    const match = description.match(/(-?)@(M(\+|-)(\d+)|Avg|Total)/);
    if (!match) return translation;

    translation.signal = (match[1] === '-' ? -1 : 1);

    if (match[2] === 'Total' || match[2] === 'Avg') {
      translation.type = match[2];
    } else {
      translation.type = 'M';
      translation.number = Number(match[3] + match[4]);
    }

    return translation;
  }

  static deepCopy (obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  static toHexString (byteArray) {
    return Array.from(byteArray, function (byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
  }

  static transpose (m) {
    return m[0].map((x, i) => m.map(x => x[i]));
  }
}

class MonthFactored extends Utils {
  static getActual () {
    const date = this.getLocaleDate();
    const yyyy = date.getFullYear();
    const financial_year = SettingsConst.getValueOf('financial_year');

    if (yyyy === financial_year) return date.getMonth() + 1;
    else if (yyyy < financial_year) return 0;
    else return 12;
  }

  static getActive () {
    const date = (this.date || this.getLocaleDate());
    const yyyy = date.getFullYear();
    const financial_year = (this.financial_year || SettingsConst.getValueOf('financial_year'));
    const initial_month = SettingsUser.getValueOf('initial_month') + 1;

    let mm = 0;

    if (yyyy === financial_year) mm = date.getMonth() + 1;
    else if (yyyy < financial_year) mm = 0;
    else mm = 12;

    return initial_month > mm ? 0 : mm - initial_month + 1;
  }

  static getMFactor () {
    const date = (this.date = this.getLocaleDate());
    const yyyy = date.getFullYear();
    const financial_year = (this.financial_year = SettingsConst.getValueOf('financial_year'));

    let mm = this.getActive();

    if (yyyy === financial_year) return --mm > 0 ? mm : 0;
    else if (yyyy < financial_year) return 0;
    else return mm;
  }
}
