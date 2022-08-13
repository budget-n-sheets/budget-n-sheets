class Addon {
  static isAuthorized () {
    if (!PropertiesService) return false;

    try {
      PropertiesService.getUserProperties();
    } catch (e) {
      return false;
    }

    return ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL).getAuthorizationStatus() === ScriptApp.AuthorizationStatus.NOT_REQUIRED;
  }

  static isInstalled () {
    let isInstalled = CacheService3.document().get('is_installed');
    if (isInstalled) return isInstalled;

    isInstalled = !!PropertiesService3.document().getProperty('is_installed');
    CacheService3.document().put('is_installed', isInstalled);

    return isInstalled;
  }

  static isUpToDate () {
    return BnsScript.isUpToDate() && BnsTemplate.isUpToDate();
  }

  static loadCache () {
    const cache = CacheService3.document();
    const isLoaded = cache.get('load_cache');
    if (isLoaded) return;

    const properties = PropertiesService3.document();
    const keys = ['class_version2', 'user_settings', 'spreadsheet_settings', 'const_properties'];
    keys.forEach(key => cache.put(key, properties.getProperty(key)));

    cache.put('load_cache', true);
  }

  static uninstall () {
    TriggersService.stop();
    const lock = !!(this.isInstalled() || BnsTemplate.isLocked());
    PropertiesService3.document().setProperties({ lock_spreadsheet: lock }, true);
    CacheService3.document().removeAll(CACHE_KEYS);
  }
}
