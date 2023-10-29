/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class ForwardInstallments {
  static forward_ (start, ranges, steps = 11) {
    if (steps < 1 || steps > 11) return

    const formatter = new NumberFormatter()
    const ledgers = new Array(12).fill(null)

    for (const range of ranges) {
      const snapshot = range.getValues()
      const installments = this.filterInstallments(snapshot)
        .map(line => {
          line[3] = formatter.localeSignal(line[3])
          return line
        })
      if (installments.length === 0) continue

      let mm = start
      let end = start + steps + 1
      if (end > 12) end = 12

      while (++mm < end && installments.length > 0) {
        const values = this.getNextInstallments(installments)
        const ledger = ledgers[mm] || (ledgers[mm] = new LedgerTtt(mm))
        ledger.mergeTransactions(values)
      }
    }
  }

  static filterInstallments (snapshot) {
    const installments = []

    for (let i = 0; i < snapshot.length; i++) {
      const line = snapshot[i]
      if (line[2] === '' || line[3] === '') continue

      const match = line[2].match(/((\d+)\/(\d+))/)
      if (!match) continue

      const p1 = +match[2]
      const p2 = +match[3]
      if (p1 >= p2) continue

      if (line[1] > 0) line[1] *= -1
      line[2] = line[2].trim()

      installments.push({
        line,
        reg: match[1],
        p1,
        p2
      })
    }

    return installments
  }

  static filterRanges (ranges) {
    const specs = SheetMonth.specs
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

  static forwardIndex (mm) {
    const range = new SheetMonth(mm).getTableRange()
    const nil = SheetMonth.specs.nullSearch - 1
    const numRows = Utils.sliceBlankValue(range.getValues(), nil).length
    if (numRows > 0) this.forward_(mm, [range.offset(0, 0, numRows)], 1)
  }

  static forwardRanges (mm, ranges) {
    this.forward_(mm, ranges)
  }

  static getNextInstallments (installments) {
    const values = []

    for (let i = 0; i < installments.length; i++) {
      const el = installments[i]

      el.p1++

      const line = el.line.slice()
      line[2] = line[2].replace(el.reg, el.p1 + '/' + el.p2)

      values.push(line)

      if (el.p1 === el.p2) {
        installments.splice(i, 1)
        i--
      }
    }

    return values
  }
}
