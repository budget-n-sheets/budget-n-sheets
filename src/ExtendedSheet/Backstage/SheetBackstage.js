/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
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
    this._specs = Object.freeze(SheetBackstage.specs)
  }

  static get specs () {
    return {
      init: { row: 2, column: 2 },
      table: {
        height: TABLE_DIMENSION.height,
        width: TABLE_DIMENSION.width
      }
    }
  }

  get specs () {
    return this._specs
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

  resetDefault () {
    this.resetProtection()
      .resetNumberFormat()
  }

  resetNumberFormat () {
    const numberFormat = FormatNumberUtils.getNumberFormat()
    this.sheet
      .getRange(
        this.specs.init.row,
        this.specs.init.column,
        this.sheet.getMaxRows() - 1,
        this.sheet.getMaxColumns() - 1)
      .setNumberFormat(numberFormat)
    return this
  }

  resetProtection () {
    this.removeProtection()
    this.sheet
      .protect()
      .setWarningOnly(true)
    return this
  }
}
