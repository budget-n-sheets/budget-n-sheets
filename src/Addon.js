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

  static uninstall () {
    TriggersService.stop();
    const lock = !!(this.isInstalled() || BnsTemplate.isLocked());
    PropertiesService3.document().setProperties({ lock_spreadsheet: lock }, true);
    CacheService3.document().removeAll(CACHE_KEYS);
  }
}
