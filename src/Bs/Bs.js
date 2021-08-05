class Bs {
  static getDeveloperKey () {
    const scriptCache = CacheService.getScriptCache();

    let key = scriptCache.get('developer_key');
    if (key) return key;

    key = PropertiesService.getScriptProperties().getProperty('developer_key');
    if (!key) {
      console.error("Bs: getDeveloperKey(): Property 'developer_key' not found");
      return 1;
    }

    scriptCache.put('developer_key', key);
    return key;
  }

  static getInnerKey () {
    const scriptCache = CacheService.getScriptCache();

    let key = scriptCache.get('inner_lock');
    if (key) return key;

    key = PropertiesService.getScriptProperties().getProperty('inner_lock');
    if (!key) {
      console.error("Bs: getInnerKey(): Property 'inner_lock' not found");
      return 1;
    }

    scriptCache.put('inner_lock', key);
    return key;
  }
}
