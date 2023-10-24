/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class FormulaBuilderTags {
  static stats () {
    return FormulaBuilderTagsStats
  }

  static table () {
    return FormulaBuilderTagsTable
  }
}

class FormulaBuilderTagsStats {
  static average () {
    let formula

    formula = 'ARRAYFORMULA(IF(E2:E <> ""; $S$2:$S/_Settings!B6; ))'
    formula = 'IF(_Settings!$B$6 > 0; ' + formula + '; ARRAYFORMULA($F$2:$F * 0))'
    formula = 'IF(_Settings!$B$7 > 0; ' + formula + '; "")'
    formula = '{"average"; ' + formula + '}'

    return formula
  }

  static total () {
    const jan = RangeUtils.rollA1Notation(2, 6, -1, 1)
    const months = RangeUtils.rollA1Notation(2, 6, -1, 12)

    let formula

    formula = 'IF(COLUMN(' + months + ') - 5 < _Settings!$B$4 + _Settings!$B$6; ROW(' + jan + '); 0)'
    formula = 'IF(COLUMN(' + months + ') - 5 >= _Settings!$B$4; ' + formula + '; 0)'
    formula = 'ARRAYFORMULA(IF(E2:E <> ""; SUMIF(' + formula + '; ROW(' + jan + '); ' + jan + '); ))'
    formula = 'IF(_Settings!$B$6 > 0; ' + formula + '; ARRAYFORMULA($F$2:$F * 0))'
    formula = 'IF(_Settings!$B$7 > 0; ' + formula + '; "")'
    formula = '{"total"; ' + formula + '}'

    return formula
  }
}

class FormulaBuilderTagsTable {
  static load_ () {
    this._settings = SettingsConst.getAll()
  }

  static month (numRowsMonth, mm) {
    this.load_()

    const _h = TABLE_DIMENSION.height
    const month = Consts.month_name.short[mm]

    let formula

    const bsblank = RangeUtils.rollA1Notation(2 + _h * mm, 6)

    const concat_tags = 'ARRAY_CONSTRAIN(' + month + '!' + RangeUtils.rollA1Notation(6, 6, numRowsMonth, 1) + '; _Backstage!' + bsblank + '; 1)'
    const concat_value_tags = 'ARRAY_CONSTRAIN(' + month + '!' + RangeUtils.rollA1Notation(6, 5, numRowsMonth, 2) + '; _Backstage!' + bsblank + '; 2)'

    formula = 'IFERROR(FILTER(' + concat_value_tags + '; REGEXMATCH(' + concat_tags + '; JOIN("|"; $E$2:$E))); "")'
    formula = 'BSSUMBYTAG(TRANSPOSE($E$1:$E); ' + formula + ')'
    formula = '{"' + Consts.month_name.long[mm].toLowerCase() + '"; IF(_Settings!$B$7 > 0; ' + formula + '; )}'

    return formula
  }
}
