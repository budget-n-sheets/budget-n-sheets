/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

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
    let isInstalled = CacheService2.getDocumentCache().get('is_installed');
    if (isInstalled) return isInstalled;

    isInstalled = !!PropertiesService2.getDocumentProperties().getProperty('is_installed');
    CacheService2.getDocumentCache().put('is_installed', isInstalled);

    return isInstalled;
  }

  static isLocked () {
    return !!PropertiesService2.getDocumentProperties().getProperty('lock_spreadsheet');
  }

  static isUpToDate () {
    return BnsScript.isUpToDate() && BnsTemplate.isUpToDate();
  }

  static loadCache () {
    const cache = CacheService2.getDocumentCache();
    const isLoaded = cache.get('load_cache');
    if (isLoaded) return;

    const properties = PropertiesService2.getDocumentProperties();
    const keys = ['class_version2', 'user_settings', 'spreadsheet_settings', 'const_properties'];
    keys.forEach(key => cache.put(key, properties.getProperty(key)));

    cache.put('load_cache', true);
  }

  static uninstall () {
    TriggersService.stop();
    const lock = !!(this.isInstalled() || this.isLocked());
    PropertiesService2.getDocumentProperties().setProperties({ lock_spreadsheet: lock }, true);
    CacheService2.getDocumentCache().removeAll(CACHE_KEYS);
  }
}
