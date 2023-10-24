/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class FormulaBuilderSummary {
  static table1 () {
    return FormulaBuilderSummaryTable1
  }

  static chart1 () {
    return FormulaBuilderSummaryChart1
  }
}

class FormulaBuilderSummaryTable1 {
  static load_ () {
    this._settings = SettingsSpreadsheet.getAll()
  }

  static income () {
    return 'IF(_Settings!B6 > 0;  {SUM(OFFSET(D8; _Settings!B4; 0; _Settings!B6; 1)); AVERAGE(OFFSET(D8; _Settings!B4; 0; _Settings!B6; 1))}; {0; 0})'
  }

  static expenses () {
    return 'IF(_Settings!B6 > 0;  {SUM(OFFSET(F8; _Settings!B4; 0; _Settings!B6; 1)); AVERAGE(OFFSET(F8; _Settings!B4; 0; _Settings!B6; 1))}; {0; 0})'
  }

  static expensesMonth (mm) {
    const _h = TABLE_DIMENSION.height

    const formula = 'SUM(_Backstage!B' + (4 + _h * mm) + ':B' + (6 + _h * mm) + ')'

    return formula
  }

  static sparklineBar () {
    this.load_()

    const s = LocaleUtils.getArrayColumnSeparator()
    let formula

    formula = `{"charttype"${s} "bar"; "max"${s} MAX(0; RC[-6])}`
    formula = `{MAX(0; -RC[-4])${s} MAX(0; RC[-2])}; ${formula}`
    formula = `SPARKLINE(${formula})`
    formula = `IF(AND(RC[-6] = 0; RC[-4] = 0); ""; ${formula})`

    return formula
  }
}

class FormulaBuilderSummaryChart1 {
  static load_ () {
    this._settings = SettingsSpreadsheet.getAll()
  }

  static data (mm) {
    this.load_()

    const dec_s = LocaleUtils.getArrayColumnSeparator()

    const income = RangeUtils.rollA1Notation(9 + mm, 4)
    const expenses = RangeUtils.rollA1Notation(9 + mm, 6)

    return `IF(OR(ROW() - 23 < '_Settings'!B4; ROW() - 23 > '_Settings'!B4 - 1 + '_Settings'!B6); {${income}${dec_s} -${expenses}${dec_s} ""${dec_s} ""}; {""${dec_s} ""${dec_s} ${income}${dec_s} -${expenses}})`
  }
}
