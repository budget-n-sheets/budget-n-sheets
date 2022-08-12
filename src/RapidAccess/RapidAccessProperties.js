class RapidAccessProperties {
  constructor (properties) {
    this._properties = properties;
  }

  admin () {
    return this._properties.admin ||
          (this._properties.admin = CachedProperties.withDocument().get('admin_settings'));
  }

  clear () {
    for (const key in this._properties) {
      this._properties[key] = null;
    }

    return this;
  }

  const () {
    return this._properties.const ||
          (this._properties.const = CachedProperties.withDocument().get('const_properties'));
  }

  spreadsheet () {
    return this._properties.spreadsheet ||
          (this._properties.spreadsheet = CachedProperties.withDocument().get('spreadsheet_settings'));
  }

  user () {
    return this._properties.user ||
          (this._properties.user = CachedProperties.withDocument().get('user_settings'));
  }
}
