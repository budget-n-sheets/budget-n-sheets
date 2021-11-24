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
        this.updateMetadata();
        break;
      }

      default:
        console.error('SettingsUser: setValueOf(): Switch case is default.', key);
        break;
    }
  }

  static updateMetadata () {
    const properties = RapidAccess.properties().spreadsheet();
    Spreadsheet2.getMetadata().update('user_settings', {
      initial_month: properties.initial_month,
      financial_calendar: properties.financial_calendar,
      post_day_events: properties.post_day_events,
      cash_flow_events: properties.cash_flow_events
    });
  }
}
