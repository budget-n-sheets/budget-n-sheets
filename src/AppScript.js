class AppsScript {
  static isInstalled () {
    let isInstalled = CacheService3.document().get('is_installed');
    if (isInstalled) return isInstalled;

    isInstalled = !!PropertiesService3.document().getProperty('is_installed');
    CacheService3.document().put('is_installed', isInstalled);

    return isInstalled;
  }

  static isLocked () {
    const isLocked = !!PropertiesService3.document().getProperty('lock_spreadsheet');
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
}
