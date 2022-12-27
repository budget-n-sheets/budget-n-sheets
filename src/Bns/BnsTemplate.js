/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
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
      SpreadsheetApp.openById(Info.template.id);
    } catch (err) {
      console.error('BnS template is not available!');
      return false;
    }
    return true;
  }

  static isLocked () {
    return !!PropertiesService2.getDocumentProperties().getProperty('lock_spreadsheet');
  }

  static isUpToDate () {
    const v0 = ClassVersion.getValueOf('template');
    const vA = Info.template.version;
    return PatchThisUtils.isLatestVersion(v0, vA);
  }
}
