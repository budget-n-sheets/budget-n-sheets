/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class RestoreCopy extends SetupSuperCopy {
  constructor (config) {
    super(config)
  }

  copyCardsDataPre15_ () {
    const source = this.source.getSheetByName('Cards')
    if (!source) return
    const numRows = source.getLastRow() - 5
    if (numRows < 1) return

    const snapshot = source.getRange(6, 1, numRows, 6 * 12).getValues()

    for (let mm = 0; mm < 12; mm++) {
      let table = snapshot.map(row => row.slice(0 + 6 * mm, 5 + 6 * mm))
      table = Utils.sliceBlankRows(table)
        .map(row => {
          const code = row.splice(2, 1)[0]
          return [code, ...row, /#ign/.test(row[3])]
        })

      new LedgerTtt(mm).mergeTransactions(table)
    }
  }

  copyTables_ () {
    if (this.name_accounts.length === 0) return

    const metadata = JSON.parse(this.metadata.get('db_accounts'))
    const accountsService = new AccountsService()

    this.name_accounts.forEach(e => {
      const acc = accountsService.getByName(e.name)
      if (acc) {
        acc.data = metadata[e.prevIndex]
        accountsService.update(acc)
      }
    })

    accountsService.flush()
  }

  copyTtt_ () {
    const names = this.name_accounts.slice()
    names.push('Wallet')
    names.push('')

    for (let mm = 0; mm < 12; mm++) {
      const source = this.source.getSheetByName(Consts.month_name.short[mm])
      if (!source) continue
      const numRows = source.getMaxRows() - 4
      if (numRows < 1) continue

      let values = source.getRange(5, 2, numRows, 6).getValues()
      values = Utils.sliceBlankRows(values).filter(r => names.indexOf(r[0]) > -1)

      new LedgerTtt(mm).mergeTransactions(values)
    }
  }

  copyTttPre15_ () {
    for (let mm = 0; mm < 12; mm++) {
      const source = this.source.getSheetByName(Consts.month_name.short[mm])
      if (!source) continue
      const numRows = source.getLastRow() - 4
      if (numRows < 1) continue

      const ledger = new LedgerTtt(mm)

      let values = source.getRange(5, 1, numRows, 4).getValues()
      values = Utils.sliceBlankRows(values)
        .map(r => ['Wallet', ...r, /#ign/.test(r[3])])
      ledger.mergeTransactions(values)

      this.name_accounts.forEach(e => {
        let values = source.getRange(5, 1 + 5 * (1 + e.prevIndex), numRows, 4)
          .getValues()
        values = Utils.sliceBlankRows(values)
          .map(r => [e.name, ...r, /#ign/.test(r[3])])
        ledger.mergeTransactions(values)
      })
    }
  }

  copy () {
    this.copyTables_()
    this.copyCards_()

    if (this.isTemplatePre15) {
      this.copyCardsDataPre15_()
      this.copyTttPre15_()
    } else {
      this.copyTtt_()
    }

    this.copyTags_()
    this.copySettings_()
  }
}
