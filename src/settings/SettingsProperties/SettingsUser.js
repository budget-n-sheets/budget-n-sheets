/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SettingsUser extends Settings {
  static get _key () {
    return 'user_settings';
  }

  static get _scope () {
    return 'document';
  }

  static updateMetadata () {
    const keys = ['initial_month', 'financial_calendar', 'post_day_events', 'cash_flow_events'];
    const properties = this.getAll(keys);
    SpreadsheetApp2.getActive().getMetadata().set(this._key, properties);
  }
}
