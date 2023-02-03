/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class BnsScript {
  static isUpToDate () {
    const v0 = ClassVersion.get('script');
    const vA = Info.apps_script.version;
    return PatchThisUtils.isLatestVersion(v0, vA);
  }
}
