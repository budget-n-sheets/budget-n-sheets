class CachedAccess {
  static get (key) {
    let properties = CacheService3.document().get(key);
    if (properties) return properties;

    properties = PropertiesService3.document().getProperty(key);
    CacheService3.document().put(key, properties);
    return properties;
  }

  static loadCache () {
    const isLoaded = CacheService3.document().get('load_cache');
    if (isLoaded) return;

    const keys = ['class_version2', 'user_settings', 'spreadsheet_settings', 'const_properties'];
    for (let i = 0; i < keys.length; i++) {
      const properties = PropertiesService3.document().getProperty(keys[i]);
      CacheService3.document().put(keys[i], properties);
    }

    CacheService3.document().put('load_cache', true);
  }

  static remove (key) {
    PropertiesService3.document().deleteProperty(key);
    CacheService3.document().remove(key);
  }

  static update (key, properties) {
    PropertiesService3.document().setProperty(key, properties);
    CacheService3.document().put(key, properties);
  }
}
