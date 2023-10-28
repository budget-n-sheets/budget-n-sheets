/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class AccountsService extends TablesService {
  constructor () {
    const db = new AccountsDb()
    super(db)
  }

  flush () {
    new SheetBackstage().resetGroupData()
    new SheetCashFlow().resetBalanceReference()
    SheetAllMonths.resetConditionalFormat().resetSelectors()
  }

  getByName (name) {
    const list = this.list()
    for (const acc of list) {
      if (acc.name === name) return acc
    }
    return null
  }

  getNamesRegExp () {
    const regExp = this.list()
      .map(acc => acc.name)
      .sort((a, b) => b.length - a.length)
      .map(e => e.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'))
      .join('|')
    return new RegExp(`(${regExp})`)
  }
}
