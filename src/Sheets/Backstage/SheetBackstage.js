class SheetBackstage {
  contructor () {
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

  getIndexRange (index) {
    return this.sheet.getRange(
      this.specs.init.row,
      this.specs.init.column + this.specs.table.width * index,
      this.specs.table.height * 12,
      this.specs.table.width);
  }

  getMonthRange (start, end) {
    const columns = this.sheet.getLastColumn() - this.specs.init.column + 1;
    if (columns < 1) return null;

    return this.sheet.getRange(
      this.specs.init.row + this.specs.table.height * start,
      this.specs.init.column,
      this.specs.table.height * (end - start),
      columns);
  }
}
