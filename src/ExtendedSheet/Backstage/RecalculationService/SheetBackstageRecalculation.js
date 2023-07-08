/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SheetBackstageRecalculation extends SheetBackstage {
  constructor () {
    super();
    this.load = SettingsSpreadsheet.get('optimize_load');
  }

  get _h () {
    return this.specs.table.height;
  }

  get _w () {
    return this.specs.table.width;
  }
}
