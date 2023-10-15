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
      row: 6,
      column: 2,
      rowOffset: 0,
      columnOffset: 1,
      width: 6,
      nullSearch: 4
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

  getHeaderRange () {
    if (this.sheet.getMaxRows() < this.specs.row - this.specs.rowOffset - 1) return null
    return this._sheet.getRange(
      1 + this.specs.rowOffset, this.specs.column,
      this.specs.row - this.specs.rowOffset - 1, this.specs.width)
  }

  getTableRange () {
    if (this.sheet.getMaxRows() < this.specs.row) return null
    return this._sheet.getRange(
      this.specs.row, this.specs.column,
      this.numRows, this.specs.width)
  }

  removeProtection () {
    const protections = this.sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET)
    for (const protection of protections) {
      if (protection.canEdit()) protection.remove()
    }

    return this
  }

  resetConditionalFormat () {
    const colors = Consts.color_palette
    let db

    for (const c in colors) {
      colors[c] = []
    }

    db = new AccountsService().getAll()
    for (const id in db) {
      const acc = db[id]
      colors[acc.color].push(acc.name)
    }

    db = new CardsService().getAll()
    for (const id in db) {
      const card = db[id]
      colors[card.color].push(card.code)
      colors[card.color] = colors[card.color].concat(card.aliases)
    }

    delete colors.whitesmoke

    for (const c in colors) {
      if (colors[c].length === 0) delete colors[c]
      else colors[c] = colors[c].join('|')
    }

    const numRows = this.numRows
    const rules = []
    let range, rule

    range = RangeUtils.rollA1Notation(this.specs.row, 5 + this.specs.columnOffset, 1, 1, 2)
    rule = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied(`=REGEXMATCH(${range}; "#(dp|wd|qcc|inc|trf)")`)
      .setBackground('#d9d2e9')
      .setRanges([this.sheet.getRange(this.specs.row, 2 + this.specs.columnOffset, numRows, this.specs.width - 1)])
      .build()
    rules.push(rule)

    range = RangeUtils.rollA1Notation(this.specs.row, 6 + this.specs.columnOffset, 1, 1, 2)
    rule = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied(`=${range}`)
      .setFontColor('#999999')
      .setRanges([this.sheet.getRange(this.specs.row, 1 + this.specs.columnOffset, numRows, this.specs.width)])
      .build()
    rules.push(rule)

    for (const color in colors) {
      const range = RangeUtils.rollA1Notation(this.specs.row, 1 + this.specs.columnOffset, 1, 1, 2)
      const rule = SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied(`=REGEXMATCH(${range}; "${colors[color]}")`)
        .setRanges([this.sheet.getRange(this.specs.row, 1 + this.specs.columnOffset, numRows, 1)])
        .setBold(true)
      if (color !== 'black') rule.setFontColor(`#${Consts.color_palette[color]}`)
      rules.push(rule.build())
    }

    this.sheet.clearConditionalFormatRules()
    this.sheet.setConditionalFormatRules(rules)

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
    this.sheet.getRange('B4').setFormula(`'Cash Flow'!${RangeUtils.rollA1Notation(2, 2 + 4 * this.mm)}`)

    // TODO
    // formula = formulaBuild.report(k, i)
    // rangeOff.offset(-1, 2 + 5 * k).setFormula(formula)

    return this
  }

  resetDefault () {
    this.resetFormatting()
      .resetProtection()
      .resetFilter()
      .resetFormulas()
      .resetConditionalFormat()
      .resetSelectors()
  }

  resetFormatting () {
    this.sheet.getRange('B1:F5').setNumberFormat('@')
    this.sheet.getRange('G1:G5').setNumberFormats([
      ['0'], ['@'], ['@'], ['@']
    ])

    const range = this.sheet
      .getRange(
        this.specs.row, 1 + this.specs.columnOffset,
        this.numRows, 1)

    range.setNumberFormat('')
    range.offset(0, 1).setNumberFormat('00')
    range.offset(0, 2).setNumberFormat('@')
    this.resetNumberFormat()
    range.offset(0, 4).setNumberFormat('@')
    range.offset(0, 5).setNumberFormat('@')
    this.resetDataValidation()

    return this
  }

  resetNumberFormat () {
    const numberFormat = FormatNumberUtils.getNumberFormat()
    this.sheet
      .getRange(
        this.specs.row, 4 + this.specs.columnOffset,
        this.numRows, 1)
      .setNumberFormat(`${numberFormat};(${numberFormat})`)

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

  resetSelectors () {
    const names = ['Wallet']
    const codes = ['Wallet']
    let db, rule

    db = new AccountsService().getAll()
    for (const id in db) {
      const acc = db[id]
      names.push(acc.name)
      codes.push(acc.name)
    }

    db = new CardsService().getAll()
    for (const id in db) {
      const card = db[id]
      names.push(card.code)
      codes.push(card.code)
      codes.push(...card.aliases)
    }

    rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(names, true)
      .setAllowInvalid(true)
      .build()

    this.sheet
      .getRange(1, 2)
      .clearDataValidations()
      .setDataValidation(rule)

    rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(codes, true)
      .setAllowInvalid(true)
      .build()

    this.sheet
      .getRange(this.specs.row, 1 + this.specs.columnOffset, this.numRows, 1)
      .clearDataValidations()
      .setDataValidation(rule)

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
