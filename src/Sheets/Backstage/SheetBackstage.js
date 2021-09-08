class SheetBackstage {
  constructor () {
    this.sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('_Backstage');

    this.num_acc = SettingsConst.getValueOf('number_accounts');

    this.specs = Object.freeze({
      init: { row: 2, column: 2 },
      table: {
        height: TABLE_DIMENSION.height,
        width: TABLE_DIMENSION.width
      }
    });
  }

  getGroupRange (monthOffset, tableOffset, numMonths, numTables) {
    if (!monthOffset) monthOffset = 0;
    if (!tableOffset) tableOffset = 0;
    if (!numMonths) numMonths = 12 - monthOffset;
    if (!numTables) numTables = 12 + this.num_acc - tableOffset;

    return this.sheet.getRange(
      this.specs.init.row + this.specs.table.height * monthOffset,
      this.specs.init.column + this.specs.table.width * tableOffset,
      this.specs.table.height * numMonths,
      this.specs.table.width * numTables
    );
  }
}
