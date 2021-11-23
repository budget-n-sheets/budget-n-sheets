class SettingsUser {
  static getValueOf (key) {
    switch (key) {
      case 'financial_calendar':
      case 'post_day_events':
      case 'override_zero':
      case 'cash_flow_events':
      case 'initial_month':
      case 'optimize_load':
        return RapidAccess.properties().user()[key];

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
      case 'optimize_load': {
        const properties = RapidAccess.properties().user();
        properties[key] = newValue;
        CachedAccess.update('user_settings', properties);
        break;
      }

      default:
        console.error('SettingsUser: setValueOf(): Switch case is default.', key);
        break;
    }
  }
}
