class SettingsAdmin {
  static load_ () {
    this._properties = RapidAccess.properties().admin();
  }

  static getValueOf (key) {
    switch (key) {
      case 'admin_id':
      case 'automatic_backup':
        this.load_();
        return this._properties[key];

      default:
        console.error('SettingsAdmin: getValueOf(): Switch case is default.', key);
        break;
    }
  }

  static setValueOf (key, newValue) {
    switch (key) {
      case 'admin_id':
      case 'automatic_backup':
        this.load_();
        this._properties[key] = newValue;
        CachedAccess.update('admin_settings', this._properties);
        break;

      default:
        console.error('SettingsAdmin: setValueOf(): Switch case is default.', key);
        break;
    }
  }
}
