class FormulaBuildTags {
  static stats () {
    return FormulaBuildTagsStats;
  }

  static table () {
    return FormulaBuildTagsTable;
  }
}

class FormulaBuildTagsStats {
  static average () {
    let formula;

    formula = 'ARRAYFORMULA(IF(E2:E <> ""; $S$2:$S/_Settings!B6; ))';
    formula = 'IF(_Settings!$B$6 > 0; ' + formula + '; ARRAYFORMULA($F$2:$F * 0))';
    formula = 'IF(_Settings!$B$7 > 0; ' + formula + '; "")';
    formula = '{"average"; ' + formula + '}';

    return formula;
  }

  static total () {
    const jan = RangeUtils.rollA1Notation(2, 6, -1, 1);
    const months = RangeUtils.rollA1Notation(2, 6, -1, 12);

    let formula;

    formula = 'IF(COLUMN(' + months + ') - 5 < _Settings!$B$4 + _Settings!$B$6; ROW(' + jan + '); 0)';
    formula = 'IF(COLUMN(' + months + ') - 5 >= _Settings!$B$4; ' + formula + '; 0)';
    formula = 'ARRAYFORMULA(IF(E2:E <> ""; SUMIF(' + formula + '; ROW(' + jan + '); ' + jan + '); ))';
    formula = 'IF(_Settings!$B$6 > 0; ' + formula + '; ARRAYFORMULA($F$2:$F * 0))';
    formula = 'IF(_Settings!$B$7 > 0; ' + formula + '; "")';
    formula = '{"total"; ' + formula + '}';

    return formula;
  }
}

class FormulaBuildTagsTable {
  static load_ () {
    this._settings = RapidAccess.properties().const();
  }

  static month (numRowsMonth, numRowsCards, mm) {
    this.load_();

    const _h = TABLE_DIMENSION.height;
    const _w = TABLE_DIMENSION.width;

    const number_accounts = this._settings.number_accounts;

    let formula, bsblank;
    let concat_tags, concat_value_tags;

    bsblank = RangeUtils.rollA1Notation(2 + _h * mm, 6);

    concat_tags = '{ARRAY_CONSTRAIN(' + Consts.month_name.short[mm] + '!' + RangeUtils.rollA1Notation(5, 4, numRowsMonth, 1) + '; _Backstage!' + bsblank + '; 1)';
    concat_value_tags = '{ARRAY_CONSTRAIN(' + Consts.month_name.short[mm] + '!' + RangeUtils.rollA1Notation(5, 3, numRowsMonth, 2) + '; _Backstage!' + bsblank + '; 2)';

    for (let k = 0; k < number_accounts; k++) {
      const bsblank = RangeUtils.rollA1Notation(2 + _h * mm, 11 + _w * k);

      concat_tags += '; ARRAY_CONSTRAIN(' + Consts.month_name.short[mm] + '!' + RangeUtils.rollA1Notation(5, 9 + 5 * k, numRowsMonth, 1) + '; _Backstage!' + bsblank + '; 1)';
      concat_value_tags += '; ARRAY_CONSTRAIN(' + Consts.month_name.short[mm] + '!' + RangeUtils.rollA1Notation(5, 8 + 5 * k, numRowsMonth, 2) + '; _Backstage!' + bsblank + '; 2)';
    }

    bsblank = RangeUtils.rollA1Notation(2 + _h * mm, 6 + _w + _w * number_accounts);

    concat_tags += '; ARRAY_CONSTRAIN(Cards!' + RangeUtils.rollA1Notation(6, 5 + 6 * mm, numRowsCards, 1) + '; _Backstage!' + bsblank + ' ; 1)}';
    concat_value_tags += '; ARRAY_CONSTRAIN(Cards!' + RangeUtils.rollA1Notation(6, 4 + 6 * mm, numRowsCards, 2) + '; _Backstage!' + bsblank + '; 2)}';

    formula = 'IFERROR(FILTER(' + concat_value_tags + '; NOT(ISBLANK(' + concat_tags + '))); "")';
    formula = 'BSSUMBYTAG(TRANSPOSE($E$1:$E); ' + formula + ')';
    formula = '{"' + Consts.month_name.long[mm].toLowerCase() + '"; IF(_Settings!$B$7 > 0; ' + formula + '; )}';

    return formula;
  }
}
