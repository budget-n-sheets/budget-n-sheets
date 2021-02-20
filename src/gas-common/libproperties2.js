/**
 * Copyright (c) 2019 Guilherme T Maeoka
 * This code is licensed under MIT license.
 * <https://github.com/guimspace/gas-common>
 */

const PropertiesService2 = {
  _document: null,
  _user: null,

  getScope: function (scope) {
    switch (scope) {
      case 'document':
        return this._document || (this._document = PropertiesService.getDocumentProperties());
      case 'user':
        return this._user || (this._user = PropertiesService.getUserProperties());
      default:
        throw new Error('Invalid scope.');
    }
  },

  getKeys: function (scope) {
    return this.getScope(scope).getKeys();
  },

  getProperty: function (scope, key, type) {
    const value = this.getScope(scope).getProperty(key);
    switch (type) {
      case 'number':
        return Number(value);
      case 'boolean':
        return value === 'true';
      case 'json':
        return JSON.parse(value);
      case 'string':
        return value;
      default:
        throw new Error('Invalid type.');
    }
  },

  getProperties: function (scope) {
    return this.getScope(scope).getProperties();
  },

  setProperty: function (scope, key, type, value) {
    switch (type) {
      case 'number':
        value = value.toString();
        break;
      case 'boolean':
        value = value ? 'true' : 'false';
        break;
      case 'json':
        value = JSON.stringify(value);
        break;
      case 'string':
        break;
      default:
        throw new Error('Invalid type.');
    }
    this.getScope(scope).setProperty(key, value);
  },

  setProperties: function (scope, properties, deleteAllOthers) {
    deleteAllOthers = !!deleteAllOthers;
    this.getScope(scope).setProperties(properties, deleteAllOthers);
  },

  setPropertiesType: function (scope, pairs, deleteAllOthers) {
    for (const key in pairs) {
      switch (pairs[key].type) {
        case 'number':
          pairs[key] = pairs[key].value.toString();
          break;
        case 'boolean':
          pairs[key] = pairs[key].value ? 'true' : 'false';
          break;
        case 'json':
          pairs[key] = JSON.stringify(pairs[key].value);
          break;
        case 'string':
          pairs[key] = pairs[key].value;
          break;
        default:
          throw new Error('Invalid type.');
      }
    }
    deleteAllOthers = !!deleteAllOthers;
    this.getScope(scope).setProperties(pairs, deleteAllOthers);
  },

  deleteProperty: function (scope, key) {
    this.getScope(scope).deleteProperty(key);
  },

  deleteAllProperties: function (scope) {
    this.getScope(scope).deleteAllProperties();
  }
};
