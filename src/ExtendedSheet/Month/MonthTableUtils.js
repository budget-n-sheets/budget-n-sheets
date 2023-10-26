/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class MonthTableUtils {
  static sliceBlankRow (values) {
    let n = values.length
    const bol = SheetMonth.specs.boolSearch - 1
    while (--n > -1) {
      values[n][bol] = values[n][bol] || ''
      if (values[n].findIndex(e => e !== '') > -1) break
    }
    n++
    return n > 0 ? values.slice(0, n) : []
  }

  static sliceBlankValue (values) {
    const nil = SheetMonth.specs.nullSearch - 1
    const n = values.findIndex(row => row[nil] === '')
    if (n === -1) return values
    return n > 0 ? values.slice(0, n) : []
  }
}
