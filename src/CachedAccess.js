class CachedAccess {
  static get (key) {
    let properties = CacheService3.document().get(key);
    if (properties) return properties;

    properties = PropertiesService3.document().getProperty(key);
    CacheService3.document().put(key, properties);
    return properties;
  }

  static update (key, properties) {
    PropertiesService3.document().setProperty(key, properties);
    CacheService3.document().put(key, properties);
  }
}