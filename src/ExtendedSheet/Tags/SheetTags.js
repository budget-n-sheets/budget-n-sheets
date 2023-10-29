/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SheetTags extends ExtendedSheet {
  constructor () {
    super('Tags')

    this._specs = Object.freeze(SheetTags.specs)
  }

  static get specs () {
    return {
      row: 2,
      column: 1,
      rowOffset: 0,
      columnOffset: 0,
      width: 5,
      nullSearch: 5,
      boolSearch: 4
    }
  }

  get numRows () {
    const numRows = this.sheet.getMaxRows() - this.specs.row + 1
    if (numRows < 1) throw new Error('Invalid number of rows.')
    return numRows
  }

  get specs () {
    return this._specs
  }

  getHeaderRange () {
    if (this.sheet.getMaxRows() < this.specs.row - this.specs.rowOffset - 1) return null
    return this._sheet.getRange(
      1 + this.specs.rowOffet, this.specs.column,
      this.specs.row - this.specs.rowOffset - 1, this.specs.width)
  }

  getTableRange () {
    return this._sheet.getRange(
      this.specs.row, this.specs.column + this.specs.width,
      this.numRows, 12 + 2)
  }

  resetDataValidation () {
    const rule = SpreadsheetApp.newDataValidation()
      .requireCheckbox()
      .build()

    this.sheet
      .getRange(
        this.specs.row, 3 + this.specs.column,
        this.numRows, 1)
      .clearDataValidations()
      .setDataValidation(rule)

    return this
  }

  resetDefault () {
    this.resetFormulas()
      .resetNumberFormat()
      .resetProtection()
  }

  resetFormatting () {
    const range = this.sheet
      .getRange(
        this.specs.row, this.specs.column,
        this.numRows, 1)

    range.setNumberFormat('@')
    range.offset(0, 1).setNumberFormat('@')
    range.offset(0, 2).setNumberFormat('@')
    range.offset(0, 3)
      .setNumberFormat('0')
      .insertCheckboxes()
    range.offset(0, 4).setNumberFormat('@')
    this.resetDataValidation()

    return this
  }

  resetFormulas () {
    const formulaBuilder = FormulaBuilder.tags()

    const formulas = Consts.month_name.short.map((v, mm) => {
      const numRows = new SheetMonth(mm).numRows
      return formulaBuilder.table().month(numRows, mm)
    })
    this.sheet.getRange('F1:Q1').setFormulas([formulas])

    this.sheet.getRange('R1').setFormula(formulaBuilder.stats().average())
    this.sheet.getRange('S1').setFormula(formulaBuilder.stats().total())

    return this
  }

  resetNumberFormat () {
    const numberFormat = NumberFormatterUtils.getFinancialFormat()
    this.sheet
      .getRange(
        this.specs.row, 1 + this.specs.width,
        this.numRows, 12 + 2)
      .setNumberFormat(numberFormat)

    return this
  }

  resetProtection () {
    this.removeProtection()
    this.sheet
      .protect()
      .setUnprotectedRanges([
        this.sheet.getRange(
          this.specs.row, 1 + this.specs.columnOffset,
          this.numRows, this.specs.width)
      ])
      .setWarningOnly(true)

    return this
  }
}
