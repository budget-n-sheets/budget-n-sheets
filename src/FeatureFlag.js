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
    const n = `flags/feature/${key}`
    switch (n) {
      case 'flags/feature/setup/follow_up':
      case 'flags/feature/setup/restore':
      case 'flags/feature/setup/copy':
      case 'flags/feature/settings/backup':
        break

      default:
        return false
    }

    const s = CacheService.getScriptCache()
    const b = s.get(n) ??
      ((s, n) => {
        const v = (PropertiesService.getScriptProperties().getProperty(n) === 'true')
        const t = v ? 'true' : 'false'
        s.put(n, t)
        return t
      })(s, n)
    return b === 'true'
  }
}
