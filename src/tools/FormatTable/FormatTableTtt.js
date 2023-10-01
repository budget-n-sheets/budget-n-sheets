/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class FormatTableTtt extends FormatTable {
  constructor (mm) {
    super();
    const name = Consts.month_name.short[mm]
    this.sheet = SpreadsheetApp2.getActive().getSheetByName(name)

    const financial_year = SettingsConst.get('financial_year')

    this.num_acc = SettingsConst.get('number_accounts')
    this.hasHideRows = (new Date(financial_year, mm + 1, 0) < Consts.date)

    this.specs = Object.freeze({
      columnOffset: 1,
      nullSearch: 4,
      row: 5,
      width: 6
    })
  }

  formatRange_ (range) {
    const column = range.getColumn()

    range.trimWhitespace().sort([
      { column: 2, ascending: true },
      { column: 3, ascending: true },
      { column: 5, ascending: true }
    ])

    const snapshot = range.getValues()

    let p = 0
    while (p < snapshot.length) {
      const code = snapshot[p][0]

      let i = snapshot.slice(p).findIndex(line => line[0] !== code || line[1] >= 0)
      if (i === -1) i = snapshot.length - p

      if (i > 1) range.offset(p, 0, i, 6).sort({ column: column, ascending: false })

      p += i
      i = snapshot.slice(p).findIndex(line => line[0] !== code)
      p += (i === -1 ? snapshot.length - p : i)
    }
  }

  hideRows_ () {
    const maxRows = this.sheet.getMaxRows()
    if (maxRows <= this.specs.row) return

    const nill = this.specs.nullSearch - 1
    let lastRow = this.sheet.getRange(
      this.specs.row, 2,
      maxRows - this.specs.row + 1, this.specs.width
    )
      .getValues()
      .findIndex(line => line[nill] === '')

    if (lastRow === -1) return
    if (lastRow < this.specs.row) lastRow = this.specs.row

    this.sheet.hideRows(lastRow + 1, maxRows - lastRow)
  }

  format () {
    if (!this.sheet) return

    const numRows = this.sheet.getLastRow() - this.specs.row + 1
    if (numRows < 2) return

    for (const range of this.rangeList.ranges) {
      if (range.getNumRows() > 1) this.formatRange_(range)
    }

    const nill = this.specs.nullSearch - 1
    for (const index of this.rangeList.indexes) {
      const range = this.sheet.getRange(
        this.specs.row, 2,
        numRows, this.specs.width)

      let row = range.getValues().findIndex(line => line[nill] === '')
      if (row === -1) row = numRows
      if (row > 1) this.formatRange_(range.offset(0, 0, row, this.specs.width))
      break
    }

    if (this.hasHideRows && this.rangeList.indexes.length > 0) this.hideRows_()

    this.rangeList = { indexes: [], ranges: [] }
    return this
  }
}
