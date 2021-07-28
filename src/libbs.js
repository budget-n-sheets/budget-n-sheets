const FormatNumber = {
  _settings: {
  },

  setSettings: function (name, value) {
    switch (name) {
      case 'decimal_separator':
      case 'decimal_places':
        this._settings[name] = value;
        break;
    }
  },

  loadSettings: function (name) {
    if (this._settings[name] != null) return;

    switch (name) {
      case 'decimal_separator':
        this._settings.decimal_separator = SettingsSpreadsheet.getValueOf('decimal_separator');
        break;
      case 'decimal_places':
        this._settings.decimal_places = SettingsSpreadsheet.getValueOf('decimal_places');
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
