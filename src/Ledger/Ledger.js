class Ledger {
  constructor (name) {
    this._sheet = Spreadsheet2.getSheetByName(name);
    this.lastRange = null;

    this._insertRows = null;
  }

  initInsertRows_ () {
    this._insertRows = ToolInsertRows.pick(this._sheet);
  }

  activate () {
    SpreadsheetApp2.getActiveSpreadsheet().setActiveSheet(this._sheet);
    this.lastRange.activate();
  }

  appendTransactions (index, values) {
    if (values.length === 0) return this;
    if (this._insertRows == null) this.initInsertRows_();

    const lastRow = this._sheet.getLastRow();
    let row = 0;

    const height = (lastRow < this._specs.row ? this._specs.row - 1 : lastRow) + values.length;
    this._insertRows.insertRowsTo(height);

    if (lastRow >= this._specs.row) {
      const snapshot = this._sheet.getRange(
        this._specs.row, 1 + (this._specs.width + 1) * index,
        lastRow - this._specs.row + 1, this._specs.width)
        .getValues();

      row = snapshot.length - 1;
      do {
        if (snapshot[row].findIndex(e => e !== '') > -1) break;
      } while (--row > -1);
      row++;
    }

    this.lastRange = this._sheet.getRange(
      this._specs.row + row,
      1 + (this._specs.width + 1) * index,
      values.length,
      this._specs.width).setValues(values);

    SpreadsheetApp.flush();
    return this;
  }

  fillInWithZeros (index) {
    const numRows = this._sheet.getLastRow() - this._specs.row + 1;
    if (numRows < 1) return this;

    const col = 3 + (this._specs.width + 1) * index;
    const table = this._sheet.getRange(this._specs.row, col, numRows, 1).getValues();

    const top = table.findIndex(row => row[0] === '') - 1;
    if (top === -2) return this;

    let n = numRows - 1;
    while (n > top && table[n][0] === '') { n--; }

    const listRanges = [];
    while (n > top) {
      if (table[n][0] === '') {
        listRanges.push(RangeUtils.rollA1Notation(this._specs.row + n, col));
      }

      n--;
    }

    if (listRanges.length > 0) {
      this._sheet.getRangeList(listRanges).setValue(0);
      SpreadsheetApp.flush();
    }
    return this;
  }

  mergeTransactions (index, values) {
    if (values.length === 0) return this;
    if (this._insertRows == null) this.initInsertRows_();

    const lastRow = this._sheet.getLastRow();
    const height = (lastRow < this._specs.row ? this._specs.row - 1 : lastRow) + values.length;

    this._insertRows.insertRowsTo(height);

    const offset = 1 + (this._specs.width + 1) * index;

    let table = [];
    if (lastRow >= this._specs.row) {
      table = this._sheet.getRange(
        this._specs.row, offset,
        lastRow - this._specs.row + 1,
        this._specs.width).getValues();
    }

    const nullSearch = this._specs.nullSearch - 1;
    let n = table.findIndex(row => row[nullSearch] === '');
    if (n === -1) n = table.length;

    table.splice.apply(table, [n, 0].concat(values));
    this._sheet.getRange(this._specs.row, offset, table.length, this._specs.width).setValues(table);

    this.lastRange = this._sheet.getRange(this._specs.row + n, offset, values.length, this._specs.width);

    SpreadsheetApp.flush();
    return this;
  }
}
