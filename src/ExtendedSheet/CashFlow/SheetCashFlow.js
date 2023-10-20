/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SheetCashFlow extends ExtendedSheet {
  constructor () {
    super('Cash Flow')
    this._specs = Object.freeze(SheetCashFlow.specs)
  }

  static get specs () {
    return {
      row: 4,
      column: 2,
      width: 3,
      height: 31
    }
  }

  get specs () {
    return this._specs
  }

  resetBalanceReference () {
    const numberFormater = new FormatNumber()
    const financial_year = SettingsConst.get('financial_year')

    const w = 1 + this.specs.width

    const formulas = ['0 + B4']
    for (let mm = 1; mm < 12; mm++) {
      const dd = new Date(financial_year, mm, 0).getDate() - 1
      formulas.push(RangeUtils.rollA1Notation(this.specs.row + dd, 3 + w * mm - w) + ' + ' + RangeUtils.rollA1Notation(this.specs.row, 2 + w * mm))
    }

    const db = new AccountsService().getAll()
    for (const id in db) {
      const mm = db[id].time_start
      formulas[mm] += numberFormater.localeSignal(db[id].balance)
    }

    const range = this.sheet.getRange('C4')
    for (let mm = 0; mm < 12; mm++) {
      range.offset(0, w * mm).setFormula(formulas[mm])
    }

    return this
  }

  resetDefault () {
    this.resetProtection()
      .resetNumberFormat()
      .resetBalanceReference()
  }

  resetFormulas () {
    const financial_year = SettingsConst.get('financial_year')
    const decS = SettingsSpreadsheet.get('decimal_separator')
    const s = decS ? ',' : '\\'
    const w = 1 + this.specs.width

    const options = `{"charttype"${s} "column"; "color"${s} "#93c47d"; "negcolor"${s} "#e06666"; "empty"${s} "zero"; "nan"${s} "convert"}`
    const range = this.sheet.getRange('B2')
    const ranges = []

    for (let mm = 0; mm < 12; mm++) {
      const n = new Date(financial_year, 1 + mm, 0).getDate()

      let formula

      formula = RangeUtils.rollA1Notation(
        this.specs.row,
        1 + this.specs.column + w * mm,
        n, 1)
      formula = `SPARKLINE(${formula}; ${options})`
      range.offset(0, w * mm).setFormula(formula)

      ranges.push(
        RangeUtils.rollA1Notation(
          1 + this.specs.row,
          1 + this.specs.column + w * mm,
          n - 1, 1))
    }

    this.sheet
      .getRangeList(ranges)
      .setFormulaR1C1('R[-1]C + RC[-1]')

    return this
  }

  resetNumberFormat () {
    const numberFormat = FormatNumberUtils.getFinancialFormat()
    const w = 1 + this.specs.width

    const ranges = []
    for (let mm = 0; mm < 12; mm++) {
      ranges.push(
        RangeUtils.rollA1Notation(
          this.specs.row,
          this.specs.column + w * mm,
          31, 2))
    }

    this.sheet
      .getRangeList(ranges)
      .setNumberFormat(numberFormat)

    return this
  }

  resetProtection () {
    this.removeProtection()

    const w = 1 + this.specs.width
    const ranges = [
      this.sheet.getRange(this.specs.row, this.specs.column, 31),
      this.sheet.getRange(this.specs.row, 2 + this.specs.column, 31)
    ]

    for (let i = 1; i < 12; i++) {
      ranges.push(
        ranges[0].offset(0, w * i),
        ranges[1].offset(0, 2 + w * i))
    }

    this.sheet
      .protect()
      .setUnprotectedRanges(ranges)
      .setWarningOnly(true)

    return this
  }

  resetWeekendColoring () {
    const financial_year = SettingsConst.get('financial_year')
    const w = 1 + this.specs.width

    const f3f3f3 = []
    const d9ead3 = []

    for (let mm = 0; mm < 12; mm++) {
      const d = new Date(financial_year, 1 + mm, 0).getDate()
      if (d < 31) {
        f3f3f3.push(
          RangeUtils.rollA1Notation(
            this.specs.row + d,
            this.specs.column + w * mm,
            31 - d, this.specs.width))
      }

      let j = 0
      let s = new Date(financial_year, mm, 1).getDay()
      while (j < d) {
        switch (s) {
          case 0: {
            d9ead3.push(
              RangeUtils.rollA1Notation(
                this.specs.row + j,
                this.specs.column + w * mm,
                1, this.specs.width))
            if (mm > 0) s = 6
            else s += 6
            j += 6
            break
          }
          case 6: {
            d9ead3.push(
              RangeUtils.rollA1Notation(
                this.specs.row + j,
                this.specs.column + w * mm,
                1, this.specs.width))
            s = 0
            j++
            break
          }
          default: {
            s = (s + 1) % 7
            j++
            break
          }
        }
      }
    }

    this.sheet.getRangeList(f3f3f3).setBackground('#f3f3f3')
    this.sheet.getRangeList(d9ead3).setBackground('#d9ead3')

    return this
  }
}
