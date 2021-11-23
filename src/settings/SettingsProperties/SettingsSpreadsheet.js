class SettingsSpreadsheet {
  static getValueOf (key) {
    switch (key) {
      case 'decimal_separator':
      case 'decimal_places':
      case 'spreadsheet_locale':
      case 'view_mode':
      case 'optimize_load':
        return RapidAccess.properties().spreadsheet()[key];

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
      case 'optimize_load': {
        const properties = RapidAccess.properties().spreadsheet();
        properties[key] = newValue;
        CachedAccess.update('spreadsheet_settings', properties);
        this.updateMetadata();
        break;
      }

      default:
        console.error('SettingsSpreadsheet: setValueOf(): Switch case is default.', key);
        break;
    }
  }

  static updateMetadata () {
    const properties = RapidAccess.properties().spreadsheet();
    new Metadata().update('spreadsheet_settings', {
      decimal_places: properties.decimal_places
    });
  }
}
