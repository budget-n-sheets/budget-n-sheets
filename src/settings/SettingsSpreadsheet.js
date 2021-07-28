class SettingsSpreadsheet {
  static load_ () {
    this._properties = RapidAccess.properties().spreadsheet();
  }

  static getValueOf (key) {
    switch (key) {
      case 'decimal_separator':
      case 'decimal_places':
      case 'spreadsheet_locale':
      case 'view_mode':
      case 'optimize_load':
        this.load_();
        return this._properties[key];

      default:
        console.error('SettingsSpreadsheet: getValueOf(): Switch case is default.', key);
        break;
    }
  }

  static setValueOf (key, newValue) {
    switch (key) {
      case 'decimal_separator':
      case 'decimal_places':
      case 'spreadsheet_locale':
      case 'view_mode':
      case 'optimize_load':
        this.load_();
        this._properties[key] = newValue;
        CachedAccess.update('spreadsheet_settings', this._properties);
        break;

      default:
        console.error('SettingsSpreadsheet: setValueOf(): Switch case is default.', key);
        break;
    }
  }
}
