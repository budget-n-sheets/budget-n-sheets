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

  static refresh (indexes) {
    if (!indexes.includes(true)) return

    const sheet = SpreadsheetApp2.getActive().getSheetByName('Cash Flow')
    if (!sheet) return

    const finCal = new FinCal()
    const accsNameRx = new AccountsService().getNamesRegExp()
    const formatter = new NumberFormatter()

    const balances = new SheetBackstage().getCardsBalances() || {}
    const yyyy = SettingsConst.get('financial_year')

    for (let mm = 0; mm < 12; mm++) {
      if (!indexes[mm]) continue

      const days = new Date(yyyy, mm + 1, 0).getDate()
      const flow = new Array(days).fill('')
      const transactions = new Array(days).fill('')
      let response

      response = this.readMonthTransactions_(accsNameRx, mm, days)
      for (let d = 0; d < days; d++) {
        flow[d] += response.flow[d].map(v => formatter.localeSignal(v)).join('')
        transactions[d] += response.transactions[d]
      }

      const upcoming = finCal.getUpcomingMonthEvents(mm)
      response = this.readCalendarTransactions_(
        upcoming, balances,
        yyyy, mm, days)
      for (let d = 0; d < days; d++) {
        flow[d] += response.flow[d].map(v => formatter.localeSignal(v)).join('')
        transactions[d] += response.transactions[d]
      }

      sheet.getRange(4, 2 + 4 * mm, days, 1).setFormulas(Utils.transpose([flow]))
      sheet.getRange(4, 4 + 4 * mm, days, 1).setValues(Utils.transpose([transactions]))
    }

    SpreadsheetApp.flush()
  }

  static readCalendarTransactions_ (upcoming, balances, yyyy, mm, days) {
    const response = {
      flow: new Array(days).fill(null).map(a => []),
      transactions: new Array(days).fill('')
    }

    const eventos = CalendarUtils.digestEvents(upcoming)
    if (eventos.length === 0) return response

    const startDate = new Date(yyyy, mm, 1)
    const endDate = new Date(yyyy, mm + 1, 1)

    for (const ev of eventos) {
      if (ev.description === '') continue
      if (ev.hasAtMute) continue

      let value = ev.value || 0

      if (isNaN(ev.value)) {
        if (ev.hasQcc && ev.card) {
          if (mm > 0) value = balances[ev.card.id][mm - 1]
        } else {
          continue
        }
      } else if (!ev.account) {
        continue
      }

      const title = `@${ev.title} `
      const first = ev.startDate < startDate ? 0 : ev.startDate.getDate() - 1
      const last = ev.endDate >= endDate ? days : ev.endDate.getDate() - 1

      for (let day = first; day < last; day++) {
        response.flow[day].push(value)
        response.transactions[day] += title
      }
    }

    return response
  }

  static readMonthTransactions_ (names, mm, days) {
    const response = {
      flow: new Array(days).fill(null).map(a => []),
      transactions: new Array(days).fill('')
    }

    const values = new SheetMonth(mm).getTableRange().getValues()
    const numRows = MonthTableUtils.sliceBlankValue(values).length

    for (let i = 0; i < numRows; i++) {
      const line = values[i]
      if (!names.test(line[0])) continue

      if (!Number.isInteger(line[1])) continue
      if (line[1] < -31 || line[1] === 0 || line[1] > days) continue
      if (line[1] < 0) {
        if (line[1] < -days) line[1] = days
        else line[1] *= -1
      }

      const day = line[1] - 1
      response.flow[day].push(line[3])
      response.transactions[day] += `@${line[2]} `
    }

    return response
  }
}
