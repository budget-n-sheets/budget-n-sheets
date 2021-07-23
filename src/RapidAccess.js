const Goldfish = {
  services: {
    cache: {
      document: null,
      user: null
    }
  }
};

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

class RapidAccessServices {
  constructor (services) {
    this._services = services;
  }

  cache () {
    return new RapidAccessServicesCache(this._services.cache);
  }
}

class RapidAccess {
  static services () {
    return new RapidAccessServices(Goldfish.services);
  }
}
