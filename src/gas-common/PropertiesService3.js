class Properties3 {
  constructor (properties) {
    this._properties = properties;
  }

  deleteAllProperties () {
    this._properties.deleteAllProperties();
    return this;
  }

  deleteProperty (key) {
    this._properties.deleteProperty(key);
    return this;
  }

  getProperty (key) {
    const value = this._properties.getProperty(key);
    return JSON.parse(value);
  }

  getProperties () {
    const all = this._properties.getProperties();
    for (const key in all) {
      all[key] = JSON.parse(all[key]);
    }

    return all;
  }

  setProperties (values, deleteAllOthers) {
    const properties = {};
    Object.assign(properties, values);
    for (const key in properties) {
      properties[key] = JSON.stringify(properties[key]);
    }

    deleteAllOthers = !!deleteAllOthers;
    this._properties.setProperties(properties, deleteAllOthers);
    return this;
  }

  setProperty (key, value) {
    this._properties.setProperty(key, JSON.stringify(value));
    return this;
  }
}

class PropertiesService3 {
  static getScope_ (scope) {
    switch (scope) {
      case 'document':
        return RapidAccess.services().properties().document();
      case 'user':
        return RapidAccess.services().properties().user();
    }
  }

  static document () {
    const properties = this.getScope_('document');
    return new Properties3(properties);
  }

  static user () {
    const properties = this.getScope_('user');
    return new Properties3(properties);
  }
}
