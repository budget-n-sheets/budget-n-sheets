/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

function getUserSettings () {
  if (!AddonUser.hasBaselinePermission()) return
  return UserSettings.getSettings();
}

function saveUserSettings (settings) {
  if (!AddonUser.hasBaselinePermission()) return 1
  new UserSettings().saveSidebarSettings(settings).flush();
}
