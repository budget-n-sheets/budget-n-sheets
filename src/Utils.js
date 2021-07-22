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
}
