/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class ResumeRecalculation extends SheetBackstageRecalculation {
  constructor () {
    super()

    this.formulas = FormulaBuilder.backstage()
  }

  xy2A1_ (index, mm, row, column, numRows = 1, numColumns = 1) {
    return RangeUtils.rollA1Notation(
      1 + row + this._h * mm,
      1 + column + this._w * index,
      numRows, numColumns
    )
  }

  resumeWallet_ () {
    const formulas = this.formulas.wallet()

    const table = new Array(this.height)
    for (let i = 0; i < this.height; i++) {
      table[i] = new Array(this._w).fill(null)
    }

    let mm = this.start - 1
    while (++mm < this.end) {
      const month = SpreadsheetApp2.getActive().getSheetByName(Consts.month_name.short[mm])
      if (!month) continue

      const maxRows = month.getMaxRows()
      const numRows = maxRows - 5
      if (numRows < 1) continue

      const offset = this._h * mm - this.rowOffset
      const bsblank = this.xy2A1_(0, mm, 1, 5)

      table[0 + offset][4] = formulas.bsblank(mm, numRows)
      table[2 + offset][0] = formulas.expensesIgn(numRows, mm, bsblank)
      table[2 + offset][1] = formulas.income(mm, `E6:E${maxRows}`, `F6:F${maxRows}`, numRows, bsblank)

      let income = this.xy2A1_(0, mm, 3, 2)
      let expenses = '0'
      for (let k = 0; k < this.num_acc; k++) {
        income += ' + ' + this.xy2A1_(1 + k, mm, 5, 2)
        expenses += ' + ' + this.xy2A1_(1 + k, mm, 3, 1)
      }

      table[1 + offset][0] = income
      table[3 + offset][0] = expenses

      table[4 + offset][0] = this.xy2A1_(1 + this.num_acc, mm, 3, 1)
      table[5 + offset][0] = this.xy2A1_(1 + this.num_acc, mm, 4, 1)
    }

    this.getGroupRange(this.start, 0, this.end - this.start, 1).clearContent().setFormulas(table)
  }

  resumeAccounts_ () {
    const formulas = this.formulas.accounts()
    const col = 2 + this._w

    const table = new Array(this.height)
    for (let i = 0; i < this.height; i++) {
      table[i] = new Array(this._w * this.num_acc).fill(null)
    }

    const regex = []
    for (let k = 0; k < this.num_acc; k++) {
      regex[k] = RangeUtils.rollA1Notation(1, col + this._w * k)
    }

    let mm = this.start - 1
    while (++mm < this.end) {
      const month = SpreadsheetApp2.getActive().getSheetByName(Consts.month_name.short[mm])
      if (!month) continue

      const maxRows = month.getMaxRows()
      const numRows = month.getMaxRows() - 5
      if (maxRows < 1) continue

      const rowOffset = this._h * mm
      const offset = rowOffset - this.rowOffset

      for (let k = 0; k < this.num_acc; k++) {
        const columnOffset = this._w * k
        let formula = ''

        const bsblank = this.xy2A1_(1 + k, mm, 1, 5)

        const balance1 = (mm === 0 ? 0 : this.xy2A1_(1 + k, mm - 1, 2, 1))
        table[0 + offset][0 + columnOffset] = '=' + balance1

        formula = formulas.income(regex[k], mm, numRows, bsblank)
        table[3 + offset][0 + columnOffset] = formula

        formula = formulas.reportTag(regex[k], 'wd', mm, numRows, bsblank)
        table[0 + offset][1 + columnOffset] = formula[0]
        table[0 + offset][2 + columnOffset] = formula[1]

        formula = formulas.reportTag(regex[k], 'dp', mm, numRows, bsblank)
        table[1 + offset][1 + columnOffset] = formula[0]
        table[1 + offset][2 + columnOffset] = formula[1]

        formula = formulas.reportTag(regex[k], 'trf+', mm, numRows, bsblank)
        table[2 + offset][1 + columnOffset] = formula[0]
        table[2 + offset][2 + columnOffset] = formula[1]

        formula = formulas.reportTag(regex[k], 'trf-', mm, numRows, bsblank)
        table[3 + offset][1 + columnOffset] = formula[0]
        table[3 + offset][2 + columnOffset] = formula[1]

        table[4 + offset][1 + columnOffset] = this.xy2A1_(1 + k, mm, 4, 1)
        table[0 + offset][4 + columnOffset] = this.xy2A1_(0, mm, 1, 5)

        const balance2 = this.xy2A1_(1 + k, mm, 1, 1)
        formula = formulas.balance(regex[k], mm, numRows, balance2, bsblank)
        table[1 + offset][0 + columnOffset] = formula

        formula = formulas.expensesIgn(regex[k], mm, numRows, bsblank)
        table[2 + offset][0 + columnOffset] = formula
      }
    }

    this.getGroupRange(this.start, 1, this.end - this.start, this.num_acc).clearContent().setFormulas(table)
  }

  resumeCards_ () {
    const formulas = this.formulas.cards()
    const indexOffset = 1 + this.num_acc + 1
    const col = 2 + this._w * indexOffset

    const listRange1 = []
    const listRange2 = []
    const listRange3 = []
    const listRange5 = []

    const table = new Array(this.height)
    for (let i = 0; i < this.height; i++) {
      table[i] = new Array(10 * this._w).fill(null)
    }

    const allBsblank = []
    for (let i = this.start; i < this.end; i++) {
      allBsblank.push(this.xy2A1_(indexOffset - 1, i, 1, 5))
    }

    const regex = [RangeUtils.rollA1Notation(1, col)]
    for (let k = 1; k < 10; k++) {
      regex[k] = RangeUtils.rollA1Notation(1, col + this._w * k)
    }

    this.getGroupRange(this.start, 1 + this.num_acc, this.end - this.start, 1).clearContent()

    let mm = this.start - 1
    while (++mm < this.end) {
      const month = SpreadsheetApp2.getActive().getSheetByName(Consts.month_name.short[mm])
      if (!month) return
      const numRows = month.getMaxRows() - 5
      if (numRows < 1) return

      const offset = this._h * mm - this.rowOffset
      let a1

      a1 = this.xy2A1_(indexOffset - 1, mm, 1, 5)
      this._sheet.getRange(a1).setFormula(`=${this.xy2A1_(0, mm, 1, 5)}`)

      a1 = this.xy2A1_(indexOffset - 1, mm, 2, 1, 4, 1)
      this._sheet.getRange(a1)
        .setFormulaR1C1('RC[5] + RC[10] + RC[15] + RC[20] + RC[25] + RC[30] + RC[35] + RC[40] + RC[45] + RC[50]')

      a1 = this.xy2A1_(indexOffset - 1, mm, 3, 1)
      this._sheet.getRange(a1)
        .setFormulaR1C1('RC[6] + RC[11] + RC[16] + RC[21] + RC[26] + RC[31] + RC[36] + RC[41] + RC[46] + RC[51]')

      const listRange4 = []
      for (let k = 0; k < 10; k++) {
        const columnOffset = this._w * k
        const bsblank = this.xy2A1_(indexOffset + k, mm, 1, 5)

        table[0 + offset][4 + columnOffset] = allBsblank[mm - this.start]
        table[1 + offset][0 + columnOffset] = formulas.credit(numRows, mm, regex[k], bsblank)
        table[2 + offset][0 + columnOffset] = formulas.expensesIgn(numRows, mm, regex[k], bsblank)
        table[3 + offset][0 + columnOffset] = formulas.expenses(numRows, mm, regex[k], bsblank)
        table[3 + offset][1 + columnOffset] = formulas.cardDue(numRows, mm, regex[k], bsblank)

        listRange1.push(this.xy2A1_(indexOffset + k, mm, 5, 1))
        listRange2.push(this.xy2A1_(indexOffset + k, mm, 5, 2))
        listRange3.push(this.xy2A1_(indexOffset + k, mm, 2, 2))
        listRange4[k] = this.xy2A1_(indexOffset + k, mm, 1, 5)
        listRange5.push(this.xy2A1_(indexOffset + k, mm, 3, 2))
      }

      this._sheet.getRangeList(listRange4).setFormula(this.xy2A1_(indexOffset - 1, mm, 1, 5))
    }

    this.getGroupRange(this.start, 2 + this.num_acc, this.end - this.start, 10).clearContent().setFormulas(table)

    this._sheet.getRangeList(listRange1).setFormulaR1C1('R[-1]C + R[-3]C')
    this._sheet.getRangeList(listRange2).setFormulaR1C1('R[-1]C + R[-4]C[-1] + RC[-1]')
    this._sheet.getRangeList(listRange3).setFormulaR1C1('MIN(R[-1]C[-1]; R[-1]C[-1] - R[3]C)')
    this._sheet.getRangeList(listRange5).setFormulaR1C1('RC[-1] + R[-1]C[-1]')
  }

  resumeBalances_ () {
    const actual = MonthFactored.getActual()
    if (this.end >= actual) return

    const rangeList = []
    const formulas = this.formulas.accounts()

    let mm = this.start
    while (++mm < actual) {
      const month = SpreadsheetApp2.getActive().getSheetByName(Consts.month_name.short[mm])
      if (!month) continue

      const maxRows = month.getMaxRows()
      if (maxRows < 6) continue

      const a1 = this.xy2A1_(1, mm, 2, 1)
      const range = this._sheet.getRange(a1)

      for (let k = 0; k < this.num_acc; k++) {
        const balance1 = this.xy2A1_(1 + k, mm, 1, 1)
        rangeList.push(balance1)

        const bsblank = this.xy2A1_(1 + k, mm, 1, 5)
        const formula = formulas.balance(mm, `E6:E${maxRows}`, balance1, bsblank)
        range.offset(0, this._w * k).setFormula(formula)
      }
    }

    this._sheet.getRangeList(rangeList).setFormulaR1C1('R[-' + (this._h - 1) + ']C')
  }

  resumeMisc_ () {
    const formater = new NumberFormatter()

    const accounts = new AccountsService().list()
    for (const account of accounts) {
      if (account.time_start < this.start) continue

      const a1 = this.xy2A1_(1 + account.index, account.time_start, 1, 1)
      this._sheet.getRange(a1).setFormula(formater.localeSignal(account.balance))
    }

    const col = 3 + this._w * (2 + this.num_acc)
    const cards = new CardsService().list()
    for (const card of cards) {
      const rangeList = []
      const formula = '=' + formater.localeSignal(card.limit)

      const index = 1 + this.num_acc + 1 + card.index
      for (let mm = this.start; mm < this.end; mm++) {
        rangeList.push(this.xy2A1_(index, mm, 1, 1))
      }

      this._sheet.getRangeList(rangeList).setFormula(formula)
    }
  }

  resume (start, end = 12) {
    if (start >= end) return

    this.start = start
    this.end = end

    this.rowOffset = this._h * start
    this.height = this._h * (end - start)

    this.resumeWallet_()
    this.resumeAccounts_()
    this.resumeCards_()

    this.resumeBalances_()
    this.resumeMisc_()

    for (let i = start; i < end; i++) {
      this.load[i] = false
    }
    SettingsSpreadsheet.set('optimize_load', this.load)

    SpreadsheetApp.flush()
    return this
  }
}
