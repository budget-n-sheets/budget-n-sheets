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
  constructor (name, specs) {
    this._sheet = SpreadsheetApp2.getActive().getSheetByName(name)
    this._specs = Object.freeze(specs)
    this._top = this._sheet.getRange(
      this._specs.row, this._specs.column,
      1, this._specs.width)
  }

  getLastRow_ () {
    const numRows = this._sheet.getMaxRows() - this._specs.row + 1
    if (numRows < 1) throw new Error('Bad sheet structure.')
    const snapshot = this._top
      .offset(0, 0, numRows)
      .getValues()
    const bol = this._specs.boolSearch - 1
    return Utils.sliceBlankRow(snapshot, bol).length
  }

  appendTransactions (values) {
    if (values.length === 0) return
    const lastRow = this.getLastRow_()

    InsertRows.insertRowsTo(this._sheet, lastRow + values.length)

    return this._top
      .offset(lastRow, 0, values.length)
      .setValues(values)
  }

  fillInWithZeros () {
    const lastRow = this.getLastRow_()
    if (lastRow < 1) return this

    const table = this._top.offset(0, 3, lastRow, 1).getValues()

    const top = table.findIndex(row => row[0] === '') - 1
    if (top === -2) return this

    let n = lastRow - 1
    while (n > top && table[n][0] === '') { n-- }

    const col = 4 + this._specs.columnOffset
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
    if (values.length === 0) return

    const lastRow = this.getLastRow_()

    let table = []
    if (lastRow > 0) {
      table = this._top
        .offset(0, 0, lastRow)
        .getValues()
    }

    const nil = this._specs.nullSearch - 1
    const numRows = Utils.sliceBlankValue(table, nil).length
    table.splice.apply(table, [numRows, 0].concat(values))

    InsertRows.insertRowsTo(this._sheet, numRows + values.length)

    return this._top
      .offset(0, 0, table.length)
      .setValues(table)
  }
}
