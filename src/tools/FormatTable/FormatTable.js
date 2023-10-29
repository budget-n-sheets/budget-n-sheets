/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class FormatTable {
  static filterRanges (ranges, specs) {
    const right = specs.columnOffset + specs.width

    return ranges.map(range => {
        if (range.getLastRow() < specs.row) return null
        if (range.getColumn() !== specs.column) return null
        if (range.getLastColumn() !== right) return null

        const l = range.getRow()
        if (l >= specs.row) return range
        const d = specs.row - l
        return range.offset(d, 0, range.getNumRows() - d)
      })
      .filter(r => r)
  }

  static format (sheet, ranges = []) {
    if (ranges.length > 0) {
      for (const range of this.ranges) {
        if (range.getNumRows() > 1) this.formatRange_(range)
      }
    } else {
      this.formatTable_(sheet)
    }
  }
}
