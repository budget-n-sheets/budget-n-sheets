/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class BnsTemplate {
  static isAvailable () {
    try {
      SpreadsheetApp.openById(Info.template.id)
    } catch (err) {
      console.error('BnS template is not available!')
      return false
    }
    return true
  }

  static isUpToDate () {
    const v0 = ClassVersion.get('template')
    const vA = Info.template.version
    return PatchThisUtils.isLatestVersion(v0, vA)
  }

  static isEndOfSupport (v) {
    const v0 = v || ClassVersion.get('template')
    const vA = Info.template.eos_version
    return !PatchThisUtils.isLatestVersion(v0, vA)
  }

  static isPre15 (v) {
    const v0 = v || ClassVersion.get('template')
    return !PatchThisUtils.isLatestVersion(v0, { major: 0, minor: 15, patch: 0 })
  }
}
