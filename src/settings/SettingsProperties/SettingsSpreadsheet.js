/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SettingsSpreadsheet extends Settings {
  static get _key () {
    return 'spreadsheet_settings';
  }

  static get _scope () {
    return 'document';
  }

  static updateMetadata () {
    const keys = ['decimal_places'];
    const properties = this.getAll(keys);
    Spreadsheet3.getMetadata().set(this._key, properties);
  }
}
