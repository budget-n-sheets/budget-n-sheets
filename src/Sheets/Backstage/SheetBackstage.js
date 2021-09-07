class SheetBackstage {
  contructor () {
    this.sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('_Backstage');

    this.specs = Object.freeze({
      init: { row: 2, column: 2 },
      table: {
        height: TABLE_DIMENSION.height,
        width: TABLE_DIMENSION.width
      }
    });
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
