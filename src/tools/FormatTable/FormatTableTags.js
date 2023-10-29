/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class FormatTableTags {
  static formatRange_ (range) {
    const last = range.trimWhitespace()
      .sort([
        { column: 1, ascending: true },
        { column: 2, ascending: true },
        { column: 3, ascending: true },
        { column: 4, ascending: false },
        { column: 5, ascending: true }
      ])
      .sort(5)
      .getValues()
      .findIndex(line => line[4] === '')
    if (last === 0) return

    const numRows = (last === -1 ? range.getNumRows() : last)
    range.offset(0, 0, numRows, 5)
      .sort([
        { column: 2, ascending: true },
        { column: 1, ascending: true }
      ])
  }

  static format (ranges = []) {
    if (ranges.length > 0) {
      for (const range of ranges) {
        if (range.getNumRows() > 1) this.formatRange_(range)
      }
    } else {
      const range = new SheetTags().getHeaderRange()
      this.formatRange_(range)
    }
    new SheetTags().resetFormatting()
  }
}
