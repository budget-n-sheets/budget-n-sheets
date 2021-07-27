class RapidAccessServices {
  constructor (services) {
    this._services = services;
  }

  cache () {
    return new RapidAccessServicesCache(this._services.cache);
  }

  properties () {
    return new RapidAccessServicesProperties(this._services.properties);
  }
}

class RapidAccessServicesCache {
  constructor (cache) {
    this._cache = cache;
  }

  document () {
    return this._cache.document ||
          (this._cache.document = CacheService.getDocumentCache());
  }

  user () {
    return this._cache.user ||
          (this._cache.user = CacheService.getUserCache());
  }
}

class RapidAccessServicesProperties {
  constructor (properties) {
    this._properties = properties;
  }

  document () {
    return this._properties.document ||
          (this._properties.document = PropertiesService.getDocumentProperties());
  }

  user () {
    return this._properties.user ||
          (this._properties.user = PropertiesService.getUserProperties());
  }
}
