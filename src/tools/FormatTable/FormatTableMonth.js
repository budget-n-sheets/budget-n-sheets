/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class FormatTableMonth {
  static formatRange_ (range) {
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

      if (i > 1) range.offset(p, 0, i, 6).sort({ column: 3, ascending: false })

      p += i
      i = snapshot.slice(p).findIndex(line => line[0] !== code)
      p += (i === -1 ? snapshot.length - p : i)
    }
  }

  static hideRows_ (month) {
    const values = month.getTableRange().getValues()

    const numRows = Utils.sliceBlankRow(values, month.specs.boolSearch - 1).length
    if (numRows === 0) return
    if (numRows === values.length) return

    month.sheet.hideRows(month.specs.row + numRows, values.length - numRows)
  }

  static format (sheet, ranges = []) {
    if (ranges.length > 0) {
      for (const range of ranges) {
        if (range.getNumRows() > 1) this.formatRange_(range)
      }
    } else {
      const mm = Consts.month_name.short.indexOf(sheet.getSheetName())
      const month = new SheetMonth(mm)
      this.formatRange_(month.getTableRange())

      const financialYear = SettingsConst.get('financial_year')
      const isPast = new Date(financialYear, mm + 1, 1) < LocaleUtils.getDate()
      if (isPast) this.hideRows_(month)
    }
  }
}
