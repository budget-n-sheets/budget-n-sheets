/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SettingsConst extends Settings {
  static get _config () {
    return {
      protect: true
    };
  }

  static get _key () {
    return 'const_properties';
  }

  static get _scope () {
    return 'document';
  }
}
