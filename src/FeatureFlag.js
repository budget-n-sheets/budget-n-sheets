/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class FeatureFlag {
  static getStatusOf (name) {
    switch (name) {
      case 'setup/restore':
      case 'setup/copy':
      case 'settings/backup':
        break;

      default:
        return false;
    }

    return PropertiesService.getScriptProperties().getProperty(name) === 'true';
  }
}
