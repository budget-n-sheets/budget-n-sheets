/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SetupFollowUp extends SetupSuperCopy {
  constructor (config) {
    super(config)
  }

  forwardInstallments_ () {
    const cards = this.source.getSheetByName('Cards')
    if (!cards) return
    const numRows = cards.getLastRow() - 5
    if (numRows < 1) return

    let values = cards.getRange(6, 1 + 6 * 11, numRows, 5).getValues()
    values = ForwardInstallments.filterInstallments(values)
    values = ForwardInstallments.getNextInstallments(values)
    if (values.length === 0) return

    this.destination
      .getSheetByName('Cards')
      .getRange(6, 1, values.length, 5)
      .setValues(values)
  }

  setupAccounts_ () {
    if (this.name_accounts.length === 0) return

    const metadata = JSON.parse(this.metadata.get('db_accounts'))
    const accounts = new AccountsService()

    const backstage = this.source.getSheetByName('_Backstage')
    const balance = backstage ? backstage.getRange(113, 7, 1, 25).getValues() : null

    const mm = this.initial_month

    this.name_accounts.forEach(e => {
      const meta = metadata[e.prevIndex]
      meta.balance = balance ? balance[0][5 * e.prevIndex] : 0
      meta.time_start = mm

      const acc = accounts.getByName(e.name)
      if (acc) {
        acc.data = meta
        accounts.update(acc)
      }
    })

    accounts.flush()
  }

  copy () {
    this.setupAccounts_()

    this.copyCards_()
    this.forwardInstallments_()

    this.copyTags_()
    this.copySettings_()
  }
}
