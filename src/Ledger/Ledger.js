class Ledger {
  constructor (sheet) {
    this._sheet = sheet;
    this._sheetName = sheet.getName();

    this._insertRows = ToolInsertRows.pick(sheet);
  }

  mergeTransactions (index, values) {
    if (values.length === 0) return;

    const lastRow = this._sheet.getLastRow();
    const height = (lastRow < this._specs.row ? this._specs.row - 1 : lastRow) + values.length;

    this._insertRows.insertRowsTo(height);

    const offset = 1 + this._specs.width * index;

    let table = [];
    if (lastRow < this._specs.row) {
      table = this._sheet.getRange(
        this._specs.row, offset,
        lastRow - this._specs.row + 1,
        this._specs.width - 1
      ).getValues();
    }

    n = table.findIndex(row => row[this._specs.col.value] === '');
    if (n === -1) n = table.length;

    table.splice.apply(table, [n, 0].concat(values));
    this._sheet.getRange(this._specs.row, offset, table.length, this._specs.width - 1).setValues(table);

    SpreadsheetApp.flush();
  }
}
