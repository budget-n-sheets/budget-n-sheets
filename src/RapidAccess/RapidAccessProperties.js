class RapidAccessProperties {
  constructor (properties) {
    this._properties = properties;
  }

  admin () {
    return this._properties.admin ||
          (this._properties.admin = CachedAccess.get('admin_settings'));
  }

  const () {
    return this._properties.const ||
          (this._properties.const = CachedAccess.get('const_properties'));
  }

  spreadsheet () {
    return this._properties.spreadsheet ||
          (this._properties.spreadsheet = CachedAccess.get('spreadsheet_settings'));
  }

  user () {
    return this._properties.user ||
          (this._properties.user = CachedAccess.get('user_settings'));
  }
}
