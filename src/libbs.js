const FormatNumber = {
  _settings: {
  },

  loadSettings: function (name) {
    if (this._settings[name]) return;

    switch (name) {
      case 'decimal_separator':
        this._settings.decimal_separator = getSpreadsheetSettings_('decimal_separator');
        break;
      case 'decimal_places':
        this._settings.decimal_places = getSpreadsheetSettings_('decimal_places');
        break;
    }
  },

  currency: function (number) {
    /** $ x,xx0.00;-$ x,xx0.00 */
    this.loadSettings('decimal_places');
    this.loadSettings('decimal_separator');

    const dec_p = this._settings.decimal_places;
    const dec_s = this._settings.decimal_separator ? '.' : ',';
    const dec_t = (dec_s === '.' ? ',' : '.');

    let n = number;

    const s = n < 0 ? '-$ ' : '$ ';

    n = Math.abs(+n || 0).toFixed(dec_p);
    const i = parseInt(n) + '';

    let j = i.length;
    j = j > 3 ? j % 3 : 0;

    return s + (j ? i.substr(0, j) + dec_t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + dec_t) + (dec_p > 0 ? dec_s + Math.abs(n - i).toFixed(dec_p).slice(2) : '');
  },

  financial: function (number) {
    /** x,xx0.00;(x,xx0.00) */
    this.loadSettings('decimal_places');
    this.loadSettings('decimal_separator');

    const dec_p = this._settings.decimal_places;
    const dec_s = this._settings.decimal_separator ? '.' : ',';
    const dec_t = (dec_s === '.' ? ',' : '.');

    let n = number;

    const s = n < 0;

    n = Math.abs(+n || 0).toFixed(dec_p);
    const i = parseInt(n) + '';

    let j = i.length;
    j = j > 3 ? j % 3 : 0;

    let a = (j ? i.substr(0, j) + dec_t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + dec_t) + (dec_p > 0 ? dec_s + Math.abs(n - i).toFixed(dec_p).slice(2) : '');

    if (s) a = '(' + a + ')';

    return a;
  },

  localeSignal: function (number) {
    /** +0.00;-0.00 */
    this.loadSettings('decimal_places');
    this.loadSettings('decimal_separator');

    const dec_p = this._settings.decimal_places;
    const dec_s = this._settings.decimal_separator ? '.' : ',';

    let n = number;

    const s = n < 0 ? '-' : '+';

    n = Math.abs(n).toFixed(dec_p);
    const i = parseInt(n) + '';

    const j = i.length;

    return s + i.substr(0, j) + (dec_p > 0 ? dec_s + Math.abs(n - i).toFixed(dec_p).slice(2) : '');
  },

  calendarSignal: function (number) {
    /** $0.00;-$0.00 */
    this.loadSettings('decimal_places');
    this.loadSettings('decimal_separator');

    const dec_p = this._settings.decimal_places;
    const dec_s = this._settings.decimal_separator ? '.' : ',';

    let n = number;

    const s = n < 0 ? '-$' : '$';

    n = Math.abs(n).toFixed(2);
    const i = parseInt(n) + '';

    const j = i.length;

    return s + i.substr(0, j) + (dec_p > 0 ? dec_s + Math.abs(n - i).toFixed(dec_p).slice(2) : '');
  }
};

/**
 * Number format +0.00;-0.00
 */
function numberFormatLocaleSignal (p_dec_p) {
  let DEC_P;

  if (p_dec_p != null) {
    DEC_P = p_dec_p ? '.' : ',';
  } else {
    DEC_P = getSpreadsheetSettings_('decimal_separator') ? '.' : ',';
  }

  let n = this;
  const s = n < 0 ? '-' : '+';
  const i = parseInt(n = Math.abs(n).toFixed(2)) + '';
  const j = i.length;
  return s + i.substr(0, j) + DEC_P + Math.abs(n - i).toFixed(2).slice(2);
}

function getTranslation () {
  const translation = { type: '', number: 0 };
  const match = this.match(/@(M(\+|-)(\d+)|Avg|Total)/);
  if (match) {
    if (match[1] === 'Total' || match[1] === 'Avg') {
      translation.type = match[1];
    } else {
      translation.type = 'M';
      translation.number = Number(match[2] + match[3]);
    }
  }

  return translation;
}

function getSpreadsheetDate () {
  let timezone = SpreadsheetApp2.getActiveSpreadsheet().getSpreadsheetTimeZone();
  if (typeof timezone !== 'string' || timezone === '') {
    timezone = 'GMT';
  }
  const date = Utilities.formatDate(this, timezone, "yyyy-MM-dd'T'HH:mm:ss'Z'");
  return new Date(date);
}

function getMonthDelta (mm) {
  if (mm == null) {
    mm = getSpreadsheetDate.call(DATE_NOW).getMonth();
  }

  switch (mm) {
    case 0:
      return [0, 3];
    case 11:
      return [-3, 0];

    default:
      return [-2, 1];
  }
}

const ConsoleLog = {
  digest: function (error, values) {
    return error;
    const payload = {};

    if (error instanceof Error) {
      for (const key in error) {
        payload[key] = error[key];
      }
    } else {
      payload.error = error;
    }

    if (values) payload.values = values;
    return payload;
  },

  info: function (msg) {
    console.info(msg);
  },

  log: function (msg) {
    console.log(msg);
  },

  warn: function (error, values) {
    const payload = this.digest(error, values);
    console.warn(payload);
  },

  error: function (error, values) {
    const payload = this.digest(error, values);
    console.error(payload);
  }
};
