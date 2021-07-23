class Cache3 {
  constructor (cache) {
    this._cache = cache;
  }

  get (key) {
    const value = this._cache.get(key);
    return JSON.parse(value);
  }

  getAll (keys) {
    const all = this._cache.getAll(keys);
    for (const key in all) {
      all[key] = JSON.parse(all[key]);
    }

    return all;
  }

  put (key, value, expiration) {
    if (!expiration) expiration = 600;
    this._cache.put(key, JSON.stringify(value), expiration);
  }

  remove (key) {
    this._cache.remove(key);
  }

  removeAll (keys) {
    this._cache.removeAll(keys);
  }
}

class CacheService3 {
  static getScope_ (scope) {
    switch (scope) {
      case 'document':
        return RapidAccess.services().cache().document();
      case 'user':
        return RapidAccess.services().cache().user();
    }
  }

  static document () {
    const cache = this.getScope_('document');
    return new Cache3(cache);
  }

  static user () {
    const cache = this.getScope_('user');
    return new Cache3(cache);
  }
}
