/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SheetSummary extends ExtendedSheet {
  constructor () {
    super('Summary')
  }

  resetCharts () {
    this.removeCharts()
    new SheetSummaryCharts().insertChart1()
  }

  resetConditionalFormat () {
    const range = this.sheet.getRange('B9:I20')
    const rules = []
    let rule

    rule = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=ROW() - 8 < INDIRECT("\'_Settings\'!B4")')
      .setFontColor('#cccccc')
      .setRanges([range])
      .build()
    rules.push(rule)

    rule = SpreadsheetApp.newConditionalFormatRule()
      .whenNumberLessThan(0.0)
      .setFontColor('#c53929')
      .setBold(true)
      .setRanges([
        this.sheet.getRange('H6:H7'),
        this.sheet.getRange('H9:H20')
      ])
      .build()
    rules.push(rule)

    rule = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=ROW() - 8 > INDIRECT("\'_Settings\'!B4") - 1 + INDIRECT("\'_Settings\'!B6")')
      .setFontColor('#999999')
      .setRanges([range])
      .build()
    rules.push(rule)

    this.sheet.clearConditionalFormatRules()
    this.sheet.setConditionalFormatRules(rules)

    return this
  }

  resetDefault () {
    this.resetProtection()
      .resetFormatting()
      .resetConditionalFormat()
      .resetFormulas()
      .resetCharts()
  }

  resetFormatting () {
    const financial_year = SettingsConst.get('financial_year')

    this.sheet
      .getRange('B2')
      .setValue(`${financial_year} | Year Summary`)

    this.resetNumberFormat()
    this.sheet.setTabColor('#e69138')

    return this
  }

  resetFormulas () {
    const formulaBuilder = FormulaBuilder.summary()
    const _h = TABLE_DIMENSION.height

    let makeFormula, formulas

    makeFormula = formulaBuilder.table1()

    this.sheet.getRange('D6').setFormula(makeFormula.income())
    this.sheet.getRange('F6').setFormula(makeFormula.expenses())

    formulas = []
    for (let i = 0; i < 12; i++) {
      formulas[i] = [
        `'_Backstage'!B${(3 + _h * i)}`, null,
        makeFormula.expensesMonth(i), null
      ]
    }
    this.sheet.getRange('D9:G20').setFormulas(formulas)

    this.sheet
      .getRangeList(['H6:H7', 'H9:H20'])
      .setFormulaR1C1('RC[-4] + RC[-2]')

    this.sheet
      .getRangeList(['J6:J7', 'J9:J20'])
      .setFormulaR1C1(makeFormula.sparklineBar())

    this.sheet.getRange('D24:I35').clearContent()

    this.sheet.getRange('H24:H35').setFormula('D$7')
    this.sheet.getRange('I24:I35').setFormula('-F$7')

    makeFormula = formulaBuilder.chart1()
    formulas = [[makeFormula.data(0).replace(/""/g, '0')]]
    for (let i = 1; i < 12; i++) {
      formulas[i] = [makeFormula.data(i)]
    }
    this.sheet.getRange('D24:D35').setFormulas(formulas)

    return this
  }

  resetNumberFormat () {
    const numberFormat = NumberFormatterUtils.getFinancialFormat()
    this.sheet
      .getRangeList(['D6:I7', 'D9:I20', 'D24:I35'])
      .setNumberFormat(numberFormat)

    return this
  }

  resetProtection () {
    this.removeProtection()
    this.sheet.protect().setWarningOnly(true)
    return this
  }
}
