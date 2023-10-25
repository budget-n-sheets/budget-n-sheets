/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class RefreshCashFlow {
  constructor () {
    this.sheet = SpreadsheetApp2.getActive().getSheetByName('Cash Flow')

    this.formater = new NumberFormatter()

    this.dec_p = SettingsSpreadsheet.get('decimal_separator')
    this.financial_year = SettingsConst.get('financial_year')

    this.balances = new SheetBackstage().getCardsBalances() || {}

    this.values = {}

    this.arrayMm = new Array(12).fill(false)
    this.specs = Object.freeze({
      cash_flow: {
        columnOffset: 1,
        row: 4,
        width: 3
      },
      ttt: SheetMonth.specs
    })
  }

  static filterRanges (ranges) {
    const name = ranges[0].getSheet().getSheetName()
    const indexes = new Array(12).fill(false)

    if (name === 'Cash Flow') {
      const specs = Object.freeze(SheetCashFlow.specs)
      const width = specs.width + 1

      for (const range of ranges) {
        const column = range.getColumn() - 2
        const last = range.getLastColumn() - 2

        const start = (column - (column % width)) / width
        let end = (last - (last % width)) / width + 1
        if (end > 12) end = 12

        for (let i = start; i < end; i++) {
          indexes[i] = true
        }
      }
    } else {
      const mm = Consts.month_name.short.indexOf(name)
      if (mm > -1) indexes[mm] = true
    }

    return indexes
  }

  get indexes () {
    return this.arrayMm
  }

  set indexes (indexes) {
    this.arrayMm = indexes
  }

  readCalendarTransactions_ () {
    const finCal = new FinCal()
    const upcoming = finCal.getUpcomingMonthEvents(this.mm)
    const events = CalendarUtils.digestEvents(upcoming)

    const tagsStats = TagsService.listTags()

    const startDate = new Date(this.financial_year, this.mm, 1)
    const endDate = new Date(this.financial_year, this.mm + 1, 1)

    for (const ev of events) {
      if (ev.description === '') continue
      if (ev.hasAtMute) continue

      let value = ev.value || 0

      // TODO: optimize this fucker
      if (isNaN(ev.value)) {
        if (ev.hasQcc) {
          if (!ev.card) continue
          if (!ev.hasWallet && !ev.account) continue

          if (this.mm > 0) value = this.balances[ev.card.id][this.mm - 1]
        } else if (ev.translation && (ev.tags.length || ev.tagImportant)) {
          const tag = ev.tagImportant || ev.tags[0]
          if (!tagsStats[tag]) continue
          if (ev.translation.type === 'Total') value = tagsStats[tag].total
          else if (ev.translation.type === 'Avg') value = tagsStats[tag].average
        } else {
          continue
        }
      } else if (!ev.account) {
        continue
      }

      value = this.formater.localeSignal(value)
      const title = '@' + ev.title + ' '

      const first = ev.startDate < startDate ? 0 : ev.startDate.getDate() - 1
      const last = ev.endDate >= endDate ? this.dd : ev.endDate.getDate() - 1

      for (let day = first; day < last; day++) {
        this.values.flow[day] += value
        this.values.transactions[day] += title
      }
    }
  }

  readTttTransactions_ () {
    const sheet = SpreadsheetApp2.getActive().getSheetByName(Consts.month_name.short[this.mm])
    if (!sheet) return

    const numRows = sheet.getLastRow() - this.specs.ttt.row + 1
    if (numRows < 1) return

    const names = new AccountsService().list().map(acc => acc.name)
    const snapshot = sheet.getRange(
      this.specs.ttt.row, this.specs.ttt.column,
      numRows, this.specs.ttt.width)
      .getValues()

    for (let i = 0; i < numRows; i++) {
      const line = snapshot[i]
      if (line[3] === '') break
      if (names.indexOf(line[0]) === -1) continue

      // TODO
      // Filter tables

      let day = +line[1]
      if (day < 1 || day > this.dd) continue

      const value = line[3]

      day--
      this.values.flow[day] += this.formater.localeSignal(value)
      this.values.transactions[day] += '@' + line[2] + ' '
    }
  }

  refresh () {
    for (let mm = 0; mm < this.arrayMm.length; mm++) {
      if (!this.arrayMm[mm]) continue

      this.dd = new Date(this.financial_year, mm + 1, 0).getDate()
      this.mm = mm

      this.values = {
        flow: new Array(this.dd).fill(''),
        transactions: new Array(this.dd).fill('')
      }

      this.readTttTransactions_()
      this.readCalendarTransactions_()

      this.sheet.getRange(4, 2 + 4 * mm, this.dd, 1).setFormulas(Utils.transpose([this.values.flow]))
      this.sheet.getRange(4, 4 + 4 * mm, this.dd, 1).setValues(Utils.transpose([this.values.transactions]))
    }

    SpreadsheetApp.flush()
    this.arrayMm = new Array(12).fill(false)

    return this
  }
}
