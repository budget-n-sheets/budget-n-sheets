/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

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
}
