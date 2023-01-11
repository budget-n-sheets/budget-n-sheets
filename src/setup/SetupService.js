/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SetupService {
  static checkRequirements () {
    if (!BnsTemplate.isAvailable()) return 1;
    if (Addon.isInstalled()) return 2;
    if (Addon.isLocked()) return 3;
    if (!AddonUser.hasBaselinePermission()) return 4
    if (SpreadsheetApp2.getActive().spreadsheet.getFormUrl()) return 5;
    return 0;
  }

  static getUuid () {
    const uuid = Utilities.getUuid();
    CacheService2.getUserCache().put(uuid, true);
    return uuid;
  }
}
