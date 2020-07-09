/**
 * Copyright (c) 2019 Guilherme T Maeoka
 * This code is licensed under MIT license.
 * <https://github.com/guimspace/gas-common>
 */

function getCacheScope_ (method) {
  switch (method) {
    case 'document':
      return CacheService.getDocumentCache()
    case 'user':
      return CacheService.getUserCache()
  }
}

/**
 * Gets the cached value for the given key, or null if none is found.
 * @param  {String} method The method to get a cache instance
 * @param  {String} key    The key to look up in the cache
 * @param  {String} type   The type of the value to return
 * @return {Object}        The value associated with the given key in the cache instance
 */
function getCacheService_ (method, key, type) {
  var cache = getCacheScope_(method)

  switch (type) {
    case 'number':
      return Number(cache.get(key))
    case 'string':
      return cache.get(key)
    case 'boolean':
      if (cache.get(key) === 'true') return true
      else return false
    case 'obj':
    case 'json':
      var p = cache.get(key)
      return JSON.parse(p)

    default:
      return cache.get(key)
  }
}

/**
 * Adds a key/value pair to the cache.
 * @param  {String} method The method to get a cache instance
 * @param  {String} key    The key to store the value under
 * @param  {String} type   The type of the value to convert
 * @param  {Object} value  The value to be cached
 */
function putCacheService_ (method, key, type, value, expiration) {
  if (expiration == null) expiration = 600

  var cache = getCacheScope_(method)

  switch (type) {
    case 'number':
      cache.put(key, value.toString(), expiration)
      break
    case 'string':
      cache.put(key, value, expiration)
      break
    case 'boolean':
      if (value) cache.put(key, 'true', expiration)
      else cache.put(key, 'false', expiration)
      break
    case 'obj':
    case 'json':
      cache.put(key, JSON.stringify(value), expiration)
      break

    default:
      cache.put(key, value, expiration)
      break
  }
}
