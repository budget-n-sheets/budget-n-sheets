/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class CardsService extends TablesService {
  constructor () {
    const db = new CardsDb()
    super(db)
  }

  delete (id) {
    this._db.delete(id)
    return this
  }

  flush () {
    new SheetBackstage().resetGroupData()
    SheetAllMonths.resetConditionalFormat().resetSelectors()
  }

  getByCode (code, withAliases = false) {
    const list = this.list()
    for (const card of list) {
      if (card.code === code) return card
      if (withAliases && card.aliases.indexOf(code) > -1) return card
    }
    return null
  }

  getCodesRegExp (withAliases = false) {
    const regExp = this.list()
      .map(card => withAliases ? card.aliases.join([card.code]) : card.code)
      .flat()
      .sort((a, b) => b.length - a.length)
      .map(e => e.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'))
      .join('|')
    return new RegExp(`(${regExp})`, 'g')
  }
}
