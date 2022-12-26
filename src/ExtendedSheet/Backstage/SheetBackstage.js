/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SheetBackstage extends ExtendedSheet {
  constructor () {
    super('_Backstage');

    this.num_acc = SettingsConst.get('number_accounts');

    this.specs = Object.freeze({
      init: { row: 2, column: 2 },
      table: {
        height: TABLE_DIMENSION.height,
        width: TABLE_DIMENSION.width
      }
    });
  }

  getGroupRange (monthOffset = 0, tableOffset = 0, numMonths, numTables) {
    if (!numMonths) numMonths = 12 - monthOffset;
    if (!numTables) numTables = 12 + this.num_acc - tableOffset;

    return this._sheet.getRange(
      this.specs.init.row + this.specs.table.height * monthOffset,
      this.specs.init.column + this.specs.table.width * tableOffset,
      this.specs.table.height * numMonths,
      this.specs.table.width * numTables
    );
  }
}
