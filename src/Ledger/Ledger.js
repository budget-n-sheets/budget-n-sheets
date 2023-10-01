/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class Ledger {
  constructor (name) {
    this._sheet = SpreadsheetApp2.getActive().getSheetByName(name);
    this.lastRange = null;

    this._insertRows = null;
  }

  getLastRow_ () {
    const numRows = this._sheet.getMaxRows() - this._specs.row + 1
    const snapshot = this._sheet.getRange(
      this._specs.row, this._specs.column,
      numRows, this._specs.width
    )
      .getValues()

    const nill = this._specs.nullSearch - 1

    let n = 0
    do {
      if (snapshot[n][nill] === '') break
    } while (++n < numRows)

    return this._specs.row + n - 1
  }

  initInsertRows_ () {
    this._insertRows = InsertRows.pick(this._sheet);
  }

  activate () {
    SpreadsheetApp2.getActive().spreadsheet.setActiveSheet(this._sheet);
    this.lastRange.activate();
  }

  appendTransactions (values) {
    if (values.length === 0) return this;
    if (this._insertRows == null) this.initInsertRows_();

    const lastRow = this.getLastRow_();
    let row = 0;

    const height = (lastRow < this._specs.row ? this._specs.row - 1 : lastRow) + values.length;
    this._insertRows.insertRowsTo(height);

    if (lastRow >= this._specs.row) {
      const snapshot = this._sheet.getRange(
        this._specs.row, this._specs.column,
        lastRow - this._specs.row + 1, this._specs.width)
        .getValues();

      row = snapshot.length - 1;
      do {
        if (snapshot[row].findIndex(e => e !== '') > -1) break;
      } while (--row > -1);
      row++;
    }

    this.lastRange = this._sheet.getRange(
      this._specs.row + row, this._specs.column,
      values.length,
      this._specs.width).setValues(values);

    SpreadsheetApp.flush();
    return this;
  }

  fillInWithZeros () {
    const numRows = this.getLastRow_() - this._specs.row + 1;
    if (numRows < 1) return this;

    const col = 5;
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

  mergeTransactions (values) {
    if (values.length === 0) return this;
    if (this._insertRows == null) this.initInsertRows_();

    const lastRow = this.getLastRow_();
    const height = (lastRow < this._specs.row ? this._specs.row - 1 : lastRow) + values.length;

    this._insertRows.insertRowsTo(height);

    const offset = this._specs.column;

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
