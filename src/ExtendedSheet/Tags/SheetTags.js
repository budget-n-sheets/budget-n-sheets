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
      nullSearch: 5
    }
  }

  get numRows () {
    const numRows = this.sheet.getMaxRows() - this.specs.row + 1
    if (numRows < 1) throw new Error('Invalid number of rows.')
    return numRows
  }

  get sheet () {
    return this._sheet
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

  removeProtection () {
    const protections = this.sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET)
    for (const protection of protections) {
      if (protection.canEdit()) protection.remove()
    }

    return this
  }

  resetDefault () {
    this.resetFormulas()
      .resetNumberFormat()
      .resetProtection()
  }

  resetFormulas () {
    const formulaBuilder = FormulaBuild.tags()

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
    const numberFormat = FormatNumberUtils.getNumberFormat()
    this.sheet
      .getRange(
        this.specs.row, 1 + this.specs.width,
        this.numRows, 12 + 2)
      .setNumberFormat(`${numberFormat};(${numberFormat})`)

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
