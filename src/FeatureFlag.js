/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class FeatureFlag {
  static getStatusOf (key) {
    const name = `flags/feature/${key}`
    switch (name) {
      case 'flags/feature/setup/follow_up':
      case 'flags/feature/setup/restore':
      case 'flags/feature/setup/copy':
      case 'flags/feature/settings/backup':
        break;

      default:
        return false;
    }

    const c = CacheService.getScriptCache();
    return c.get(name) ?? ((c) => {
      const v = ('true' === PropertiesService.getScriptProperties().getProperty(name))
      c.put(name, v);
      return v;
    })(c);
  }
}
