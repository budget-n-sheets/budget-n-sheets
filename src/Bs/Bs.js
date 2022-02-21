class Bs {
  static getDeveloperKey () {
    const scriptCache = CacheService.getScriptCache();

    let key = scriptCache.get('developer_key');
    if (key) return key;

    key = PropertiesService.getScriptProperties().getProperty('developer_key');
    if (!key) throw new Error('Bs: getDeveloperKey(): Property "developer_key" not found');

    scriptCache.put('developer_key', key);
    return key;
  }

  static getInnerKey () {
    const scriptCache = CacheService.getScriptCache();

    let key = scriptCache.get('inner_lock');
    if (key) return key;

    key = PropertiesService.getScriptProperties().getProperty('inner_lock');
    if (!key) throw new Error('Bs: getInnerKey(): Property "inner_lock" not found');

    scriptCache.put('inner_lock', key);
    return key;
  }
}
