class SettingsUser {
  static load_ () {
    this._properties = RapidAccess.properties().user();
  }

  static getValueOf (key) {
    switch (key) {
      case 'financial_calendar':
      case 'post_day_events':
      case 'override_zero':
      case 'cash_flow_events':
      case 'initial_month':
      case 'optimize_load':
        this.load_();
        return this._properties[key];

      default:
        console.error('SettingsUser: getValueOf(): Switch case is default.', key);
        break;
    }
  }

  static setValueOf (key, newValue) {
    switch (key) {
      case 'financial_calendar':
      case 'post_day_events':
      case 'override_zero':
      case 'cash_flow_events':
      case 'initial_month':
      case 'optimize_load':
        this.load_();
        this._properties[key] = newValue;
        CachedAccess.update('user_settings', this._properties);
        break;

      default:
        console.error('SettingsUser: setValueOf(): Switch case is default.', key);
        break;
    }
  }
}
