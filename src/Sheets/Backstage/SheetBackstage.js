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
}
