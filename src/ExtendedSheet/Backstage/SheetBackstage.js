/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SheetBackstage extends ExtendedSheet {
  constructor () {
    super('_Backstage')

    this.num_acc = SettingsConst.get('number_accounts')
    this._specs = Object.freeze(SheetBackstage.specs)
  }

  static get specs () {
    return {
      init: { row: 2, column: 2 },
      table: {
        height: TABLE_DIMENSION.height,
        width: TABLE_DIMENSION.width
      }
    }
  }

  get specs () {
    return this._specs
  }

  getCardsBalances () {
    const cards = new CardsService().list()
    if (cards.length === 0) return null

    const balances = {}
    const _h = TABLE_DIMENSION.height
    const _w = TABLE_DIMENSION.width

    const numAccs = SettingsConst.get('number_accounts')
    const snapshot = this.getGroupRange(0, 2 + numAccs, 12).getValues()

    for (const card of cards) {
      const id = card.id
      const index = card.index

      balances[id] = new Array(12).fill(0)
      for (let mm = 0; mm < 12; mm++) {
        balances[id][mm] = +snapshot[4 + _h * mm][_w * index]
      }
    }

    return balances
  }

  getGroupRange (monthOffset = 0, tableOffset = 0, numMonths, numTables) {
    if (!numMonths) numMonths = 12 - monthOffset
    if (!numTables) numTables = 12 + this.num_acc - tableOffset

    return this._sheet.getRange(
      this.specs.init.row + this.specs.table.height * monthOffset,
      this.specs.init.column + this.specs.table.width * tableOffset,
      this.specs.table.height * numMonths,
      this.specs.table.width * numTables
    )
  }

  resetDefault () {
    this.resetProtection()
      .resetNumberFormat()
  }

  resetGroupData () {
    const numberFormater = new NumberFormatter()
    const _h = this.specs.table.height
    const _w = this.specs.table.width

    const cellReference = this.sheet.getRange('B1')
    let list

    this.sheet.getRange(
      1, 2, 1,
      this.sheet.getMaxColumns() - 1)
      .clearContent()
    cellReference.setValue('\^Wallet\$')

    list = new AccountsService().list()
    const tablesOffset = list.length

    for (const acc of list) {
      const range = cellReference.offset(0, _w * (1 + acc.index))
      const column = range.getColumn()

      range.setValue(`\^${acc.name}\$`)

      range.offset(1, 0).setFormula('0')

      const ranges = []
      for (let i = 1; i < 12; i++) {
        ranges.push(RangeUtils.rollA1Notation(2 + _h * i, column))
      }
      this.sheet
        .getRangeList(ranges)
        .setFormulaR1C1(`R[-${_h - 1}]C`)

      range.offset(1 + _h * acc.time_start, 0)
        .setFormula(numberFormater.localeSignal(acc.balance))
    }

    cellReference.offset(0, _w * (1 + tablesOffset)).setValue('\^Cards\$')

    list = new CardsService().list()
    for (const card of list) {
      const range = cellReference.offset(0, _w * (2 + tablesOffset + card.index))
      const column = range.getColumn()

      range.setValue(`\^${card.code}\$` + card.aliases.map(a => `|\^${a}\$`).join(''))

      const ranges = []
      for (let i = 0; i < 12; i++) {
        ranges.push(RangeUtils.rollA1Notation(2 + _h * i, column))
      }
      this.sheet
        .getRangeList(ranges)
        .setFormula(numberFormater.localeSignal(card.limit))
    }

    return this
  }

  resetNumberFormat () {
    const numberFormat = NumberFormatterUtils.getNumberFormat()
    this.sheet
      .getRange(
        this.specs.init.row,
        this.specs.init.column,
        this.sheet.getMaxRows() - 1,
        this.sheet.getMaxColumns() - 1)
      .setNumberFormat(numberFormat)
    return this
  }

  resetProtection () {
    this.removeProtection()
    this.sheet
      .protect()
      .setWarningOnly(true)
    return this
  }
}
