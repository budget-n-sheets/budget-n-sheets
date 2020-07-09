/**
 * Copyright (c) 2019 Guilherme T Maeoka
 * This code is licensed under MIT license.
 * <https://github.com/guimspace/gas-common>
 */

function getPropertiesScope_ (method) {
  switch (method) {
    case 'document':
      return PropertiesService.getDocumentProperties()
    case 'user':
      return PropertiesService.getUserProperties()
  }
}

/**
 * Gets the value associated with the given key in the current Properties store, or null if no such key exists.
 * @param  {String} method The method to get a property store
 * @param  {String} key    The key for the property
 * @param  {String} type   The type of the value to return
 * @return {Object}        The value associated with the given key in the current Properties store
 */
function getPropertiesService_ (method, key, type) {
  var properties = getPropertiesScope_(method)

  switch (type) {
    case 'number':
      return Number(properties.getProperty(key))
    case 'string':
      return properties.getProperty(key)
    case 'boolean':
      if (properties.getProperty(key) === 'true') return true
      else return false
    case 'obj':
    case 'json':
      var p = properties.getProperty(key)
      return JSON.parse(p)

    default:
      return properties.getProperty(key)
  }
}

/**
 * Sets the given key-value pair in the current Properties store.
 * @param  {String} method The method to get a property store
 * @param  {String} key    The key for the property
 * @param  {String} type   The type of the value to convert
 * @param  {Object} value  The value to associate with the key
 */
function setPropertiesService_ (method, key, type, value) {
  var properties = getPropertiesScope_(method)

  switch (type) {
    case 'number':
      properties.setProperty(key, value.toString())
      break
    case 'string':
      properties.setProperty(key, value)
      break
    case 'boolean':
      if (value) properties.setProperty(key, 'true')
      else properties.setProperty(key, 'false')
      break
    case 'obj':
    case 'json':
      properties.setProperty(key, JSON.stringify(value))
      break

    default:
      properties.setProperty(key, value)
      break
  }
}

/**
 * Deletes the given key-value pair in the current Properties store.
 * @param  {String} method The method to get a property store
 * @param  {String} key    The key for the property
 */
function deletePropertiesService_ (method, key) {
  var properties = getPropertiesScope_(method)

  properties.deleteProperty(key)
}

/**
 * Purges all key-value pairs in specific or all Properties store.
 * @param  {String} method The method to get a property store
 */
function purgePropertiesService_ (method) {
  switch (method) {
    case 'document':
      PropertiesService.getDocumentProperties().deleteAllProperties()
      break
    case 'user':
      PropertiesService.getUserProperties().deleteAllProperties()
      break

    default:
      PropertiesService.getDocumentProperties().deleteAllProperties()
      PropertiesService.getUserProperties().deleteAllProperties()
      break
  }
}
