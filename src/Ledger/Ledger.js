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
    this._sheet = SpreadsheetApp2.getActive().getSheetByName(name)
    this.lastRange = null
  }

  getLastRow_ () {
    const numRows = this._sheet.getMaxRows() - this._specs.row + 1
    const snapshot = this._sheet.getRange(
      this._specs.row, this._specs.column,
      numRows, this._specs.width - 1)
      .getValues()

    let n = snapshot.length
    while (--n > -1) {
      if (snapshot[n].findIndex(e => e !== '') > -1) break
    }
    return ++n
  }

  activate () {
    SpreadsheetApp2.getActive().spreadsheet.setActiveSheet(this._sheet)
    this.lastRange.activate()
  }

  appendTransactions (values) {
    if (values.length === 0) return this

    const numRows = this.getLastRow_()
    InsertRows.insertRowsTo(this._sheet, this._specs.row + numRows + values.length)

    this.lastRange = this._sheet.getRange(
      this._specs.row + numRows, this._specs.column,
      values.length, this._specs.width)
      .setValues(values)

    SpreadsheetApp.flush()
    return this
  }

  fillInWithZeros () {
    const numRows = this.getLastRow_()
    if (numRows < 1) return this

    const col = 4 + this._specs.columnOffset
    const table = this._sheet.getRange(this._specs.row, col, numRows, 1).getValues()

    const top = table.findIndex(row => row[0] === '') - 1
    if (top === -2) return this

    let n = numRows - 1
    while (n > top && table[n][0] === '') { n-- }

    const listRanges = []
    while (n > top) {
      if (table[n][0] === '') {
        listRanges.push(RangeUtils.rollA1Notation(this._specs.row + n, col))
      }

      n--
    }

    if (listRanges.length > 0) {
      this._sheet.getRangeList(listRanges).setValue(0)
      SpreadsheetApp.flush()
    }
    return this
  }

  mergeTransactions (values) {
    if (values.length === 0) return this

    const numRows = this.getLastRow_()
    InsertRows.insertRowsTo(this._sheet, this._specs.row + numRows + values.length)

    let table = []
    if (numRows > 0) {
      table = this._sheet.getRange(
        this._specs.row, this._specs.column,
        numRows, this._specs.width)
        .getValues()
    }

    const nill = this._specs.nullSearch - 1
    let n = table.findIndex(row => row[nill] === '')
    if (n === -1) n = table.length

    table.splice.apply(table, [n, 0].concat(values))
    this._sheet.getRange(
      this._specs.row, this._specs.column,
      table.length, this._specs.width)
      .setValues(table)

    this.lastRange = this._sheet.getRange(
      this._specs.row + n, this._specs.column,
      values.length, this._specs.width)

    SpreadsheetApp.flush()
    return this
  }
}
