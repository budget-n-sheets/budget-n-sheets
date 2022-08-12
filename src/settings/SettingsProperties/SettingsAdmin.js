class SettingsAdmin {
  static getValueOf (key) {
    switch (key) {
      case 'admin_id':
      case 'automatic_backup':
        return RapidAccess.properties().admin()[key];

      default:
        console.error('SettingsAdmin: getValueOf(): Switch case is default.', key);
        break;
    }
  }

  static setValueOf (key, newValue) {
    switch (key) {
      case 'admin_id':
      case 'automatic_backup': {
        const properties = RapidAccess.properties().admin();
        properties[key] = newValue;
        CachedProperties.withDocument().update('admin_settings', properties);
        break;
      }

      default:
        console.error('SettingsAdmin: setValueOf(): Switch case is default.', key);
        break;
    }
  }
}
