/**
 * Copyright (c) 2019 Guilherme T Maeoka
 * This code is licensed under MIT license.
 * <https://github.com/guimspace/gas-common>
 */

var PropertiesService2 = {
  document: null,
  user: null,

  getScope: function (scope) {
    if (this[scope]) return
    switch (scope) {
      case 'document':
        this.document = PropertiesService.getDocumentProperties()
        break
      case 'user':
        this.user = PropertiesService.getUserProperties()
        break
      default:
        throw new Error('Invalid scope.')
    }
  },

  getKeys: function (scope) {
    this.getScope(scope)
    return this[scope].getKeys()
  },

  getProperty: function (scope, key, type) {
    this.getScope(scope)
    var value = this[scope].getProperty(key)
    switch (type) {
      case 'number':
        return Number(value)
      case 'boolean':
        return value === 'true'
      case 'json':
        return JSON.parse(value)
      case 'string':
        return value
      default:
        throw new Error('Invalid type.')
    }
  },

  getProperties: function (scope) {
    this.getScope(scope)
    return this[scope].getProperties()
  },

  setProperty: function (scope, key, type, value) {
    this.getScope(scope)
    switch (type) {
      case 'number':
        value = value.toString()
        break
      case 'boolean':
        value = value ? 'true' : 'false'
        break
      case 'json':
        value = JSON.stringify(value)
        break
      case 'string':
        break
      default:
        throw new Error('Invalid type.')
    }
    this[scope].setProperty(key, value)
  },

  setProperties: function (scope, properties, deleteAllOthers) {
    this.getScope(scope)
    deleteAllOthers = deleteAllOthers ? true : false
    this[scope].setProperties(properties, deleteAllOthers)
  },

  setPropertiesType: function (scope, pairs, del) {
    this.getScope(scope)
    for (var key in pairs) {
      switch (pairs[key].type) {
        case 'number':
          pairs[key] = pairs[key].value.toString()
          break
        case 'boolean':
          pairs[key] = pairs[key].value ? 'true' : 'false'
          break
        case 'json':
          pairs[key] = JSON.stringify(pairs[key].value)
          break
        case 'string':
          pairs[key] = pairs[key].value
          break
        default:
          throw new Error('Invalid type.')
      }
    }
    this[scope].setProperties(pairs, del)
  },

  deleteProperty: function (scope, key) {
    this.getScope(scope)
    this[scope].deleteProperty(key)
  },

  deleteAllProperties: function (scope) {
    this.getScope(scope)
    this[scope].deleteAllProperties()
  }
}
