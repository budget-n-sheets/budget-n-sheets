/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SheetMonth extends ExtendedSheet {
  constructor (mm) {
    const name = Consts.month_name.short[mm]
    super(name)

    this._config = { mm, name }
    this._specs = Object.freeze(SheetMonth.specs)
  }

  static get specs () {
    return {
      columnOffset: 1,
      rowOffset: 0,
      nullSearch: 4,
      row: 5,
      width: 6
    }
  }

  get mm () {
    return this._config.mm
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

  removeProtection () {
    const protections = this.sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET)
    for (const protection of protections) {
      if (protection.canEdit()) protection.remove()
    }

    return this
  }

  resetDataValidation () {
    let rule

    this.resetUniqueSuggestions()

    rule = SpreadsheetApp.newDataValidation()
      .requireCheckbox()
      .build()

    this.sheet
      .getRange(
        this.specs.row, 6 + this.specs.columnOffset,
        this.numRows, 1
      )
      .clearDataValidations()
      .setDataValidation(rule)

    return this
  }

  resetFilter () {
    const range = this.sheet
      .getRange(
        this.specs.row - 1, 1 + this.specs.columnOffset,
        this.numRows + 1, this.specs.width
      )

    const filter = range.getFilter()
    if (filter) filter.remove()

    range.createFilter()

    return this
  }

  resetFormulas () {
    const formulaBuilder = FormulaBuild.ttt().header()
    const numAccs = SettingsConst.get('number_accounts')

    let formula

    formula = formulaBuilder.index(numAccs)
    this.sheet.getRange('G1').setFormula(formula)
    this.sheet.getRange('G2').setFormula(`G1 > ${numAccs}`)

    formula = formulaBuilder.balance(this.mm)
    this.sheet.getRange('B2').setFormula(formula)

    formula = formulaBuilder.expenses(this.mm)
    this.sheet.getRange('B3').setFormula(formula)

    // TODO
    // formula = formulaBuild.report(k, i)
    // rangeOff.offset(-1, 2 + 5 * k).setFormula(formula)

    return this
  }

  resetDefault () {
    this.resetNumberFormat()
      .resetProtection()
      .resetDataValidation()
      .resetFilter()
      .resetFormulas()
  }

  resetNumberFormat () {
    this.sheet
      .getRange(
        this.specs.row - 1, 1 + this.specs.columnOffset,
        this.numRows, this.specs.width
      )
      .setNumberFormat(FormatNumberUtils.getNumberFormat())

    return this
  }

  resetProtection () {
    this.removeProtection()

    this.sheet
      .protect()
      .setUnprotectedRanges([
        this.sheet.getRange('B1:D1'),
        this.sheet.getRange(
          this.specs.row, 1 + this.specs.columnOffset,
          this.numRows, this.specs.width
        )
      ])
      .setWarningOnly(true)

    return this
  }

  resetUniqueSuggestions () {
    const unique = SpreadsheetApp2.getActive().getSheetByName('_Unique')
    if (!unique) return

    let rule

    rule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(unique.getRange('A:A'), false)
      .setAllowInvalid(true)
      .build()

    this.sheet
      .getRange(
        this.specs.row, 3 + this.specs.columnOffset,
        this.numRows, 1
      )
      .clearDataValidations()
      .setDataValidation(rule)

    rule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(unique.getRange('B:B'), false)
      .setAllowInvalid(true)
      .build()

    this.sheet
      .getRange(
        this.specs.row, 5 + this.specs.columnOffset,
        this.numRows, 1
      )
      .clearDataValidations()
      .setDataValidation(rule)

    return this
  }
}
