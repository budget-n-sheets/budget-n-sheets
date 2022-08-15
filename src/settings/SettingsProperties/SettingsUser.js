class SettingsUser extends Settings {
  static get _key () {
    return 'user_settings';
  }

  static get _scope () {
    return 'document';
  }

  static updateMetadata () {
    const keys = ['initial_month', 'financial_calendar', 'post_day_events', 'cash_flow_events'];
    const properties = this.getAll(keys);
    Spreadsheet2.getMetadata().update(this._key, properties);
  }
}
