class FormulaBuildBackstage {
  static accounts () {
    return FormulaBuildBackstageAccounts;
  }

  static cards () {
    return FormulaBuildBackstageCards;
  }

  static wallet () {
    return FormulaBuildBackstageWallet;
  }
}

class FormulaBuildBackstageAccounts {
  static balance (mm, value, balance, bsblank) {
    let formula;

    formula = 'NOT(ISBLANK(ARRAY_CONSTRAIN(' + MONTH_NAME.short[mm] + '!' + value + '; ' + bsblank + '; 1)))';
    formula = 'FILTER(ARRAY_CONSTRAIN(' + MONTH_NAME.short[mm] + '!' + value + '; ' + bsblank + '; 1); ' + formula + ')';
    formula = balance + ' + IFERROR(SUM(' + formula + '); 0)';

    return formula;
  }

  static expensesIgn (mm, value, tags, bsblank) {
    let formula;

    formula = 'NOT(REGEXMATCH(ARRAY_CONSTRAIN(' + MONTH_NAME.short[mm] + '!' + tags + '; ' + bsblank + '; 1); "#(dp|wd|qcc|ign|rct|trf)"))';
    formula = 'NOT(ISBLANK(ARRAY_CONSTRAIN(' + MONTH_NAME.short[mm] + '!' + value + '; ' + bsblank + '; 1))); ' + formula;
    formula = 'FILTER(ARRAY_CONSTRAIN(' + MONTH_NAME.short[mm] + '!' + value + '; ' + bsblank + '; 1); ' + formula + ')';
    formula = 'IFERROR(SUM(' + formula + '); 0)';

    return formula;
  }

  static bsreport (mm, tags, value_tags, bsblank) {
    let formula;

    formula = 'NOT(ISBLANK(ARRAY_CONSTRAIN(' + MONTH_NAME.short[mm] + '!' + tags + '; ' + bsblank + '; 1)))';
    formula = 'IFERROR(FILTER(ARRAY_CONSTRAIN(' + MONTH_NAME.short[mm] + '!' + value_tags + '; ' + bsblank + '; 2); ' + formula + '); "")';
    formula = 'BSREPORT(TRANSPOSE(' + formula + '))';

    return formula;
  }

  static bsblank (mm, header, value) {
    return 'MIN(ARRAYFORMULA(IF(ISBLANK(' + MONTH_NAME.short[mm] + '!' + value + '); ROW(' + MONTH_NAME.short[mm] + '!' + value + ') - ROW(' + MONTH_NAME.short[mm] + '!' + header + '); FALSE)); ROWS(' + MONTH_NAME.short[mm] + '!' + value + '))';
  }
}

class FormulaBuildBackstageCards {
  static load_ () {
    this._settings = RapidAccess.properties().spreadsheet();
  }

  static credit (numRows, mm, regex, bsblank) {
    const card = RangeUtils.rollA1Notation(6, 3 + 6 * mm, numRows);
    const value = RangeUtils.rollA1Notation(6, 4 + 6 * mm, numRows);

    let formula;

    formula = 'ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1); ';
    formula += 'REGEXMATCH(ARRAY_CONSTRAIN(Cards!' + card + '; ' + bsblank + '; 1); ' + regex + '); ';
    formula += 'NOT(ISBLANK(ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1))); ';
    formula += 'ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1) >= 0';

    formula = 'SUM(FILTER(' + formula + '))';
    formula = 'IFERROR(IF(' + regex + ' = ""; ""; ' + formula + '); 0)';

    return formula;
  }

  static expenses (numRows, mm, regex, bsblank) {
    const card = RangeUtils.rollA1Notation(6, 3 + 6 * mm, numRows);
    const value = RangeUtils.rollA1Notation(6, 4 + 6 * mm, numRows);

    let formula;

    formula = 'ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1); ';
    formula += 'REGEXMATCH(ARRAY_CONSTRAIN(Cards!' + card + '; ' + bsblank + '; 1); ' + regex + '); ';
    formula += 'NOT(ISBLANK(ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1))); ';
    formula += 'ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1) < 0';

    formula = 'SUM(FILTER(' + formula + '))';
    formula = 'IFERROR(IF(' + regex + ' = ""; ""; ' + formula + '); 0)';

    return formula;
  }

  static expensesIgn (numRows, mm, regex, bsblank) {
    const card = RangeUtils.rollA1Notation(6, 3 + 6 * mm, numRows);
    const value = RangeUtils.rollA1Notation(6, 4 + 6 * mm, numRows);
    const tags = RangeUtils.rollA1Notation(6, 5 + 6 * mm, numRows);

    let formula;

    formula = 'ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1); ';
    formula += 'REGEXMATCH(ARRAY_CONSTRAIN(Cards!' + card + '; ' + bsblank + '; 1); ' + regex + '); ';
    formula += 'NOT(ISBLANK(ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1))); ';
    formula += 'ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1) < 0; ';
    formula += 'NOT(REGEXMATCH(ARRAY_CONSTRAIN(Cards!' + tags + '; ' + bsblank + '; 1); "#ign"))';

    formula = 'SUM(FILTER(' + formula + '))';
    formula = 'IFERROR(IF(' + regex + ' = ""; ""; ' + formula + '); 0)';

    return formula;
  }

  static bscardpart (numRows, mm, regex, bsblank) {
    this.load_();

    const transaction = RangeUtils.rollA1Notation(6, 2 + 6 * mm, numRows);
    const card = RangeUtils.rollA1Notation(6, 3 + 6 * mm, numRows);
    const value = RangeUtils.rollA1Notation(6, 4 + 6 * mm, numRows);
    const tags = RangeUtils.rollA1Notation(6, 5 + 6 * mm, numRows);

    const dec_s = this._settings.decimal_separator ? ',' : '\\';

    let formula;

    formula = 'REGEXEXTRACT(ARRAY_CONSTRAIN(Cards!' + transaction + '; ' + bsblank + '; 1); "[0-9]+/[0-9]+")';
    formula = 'ARRAYFORMULA(SPLIT(' + formula + '; "/"))';

    formula = '{' + formula + dec_s + ' ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1)}; ';
    formula += 'REGEXMATCH(ARRAY_CONSTRAIN(Cards!' + card + '; ' + bsblank + '; 1); ' + regex + '); ';
    formula += 'NOT(ISBLANK(ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1))); ';
    formula += 'REGEXMATCH(ARRAY_CONSTRAIN(Cards!' + transaction + '; ' + bsblank + '; 1); "[0-9]+/[0-9]+")';

    formula = 'BSCARDPART(TRANSPOSE(IFNA(FILTER(' + formula + '); 0)))';
    formula = 'IF(' + regex + ' = ""; 0; ' + formula + ')';

    return formula;
  }

  static bsblank (numRows, mm) {
    const header = RangeUtils.rollA1Notation(5, 4 + 6 * mm);
    return 'MIN(ARRAYFORMULA(IF(ISBLANK(Cards!' + RangeUtils.rollA1Notation(6, 4 + 6 * mm, numRows, 1) + '); ROW(Cards!' + RangeUtils.rollA1Notation(6, 4 + 6 * mm, numRows, 1) + ') - ROW(Cards!' + header + '); FALSE)); ROWS(Cards!' + RangeUtils.rollA1Notation(6, 4 + 6 * mm, numRows, 1) + '))';
  }
}

class FormulaBuildBackstageWallet {
  static bsblank (mm, value) {
    const header = 'C4'; // RangeUtils.rollA1Notation(4, 3);
    return 'MIN(ARRAYFORMULA(IF(ISBLANK(' + MONTH_NAME.short[mm] + '!' + value + '); ROW(' + MONTH_NAME.short[mm] + '!' + value + ') - ROW(' + MONTH_NAME.short[mm] + '!' + header + '); FALSE)); ROWS(' + MONTH_NAME.short[mm] + '!' + value + '))';
  }

  static expensesIgn (numRows, mm, bsblank) {
    const value = RangeUtils.rollA1Notation(5, 3, numRows, 1);
    const tags = RangeUtils.rollA1Notation(5, 4, numRows, 1);

    let formula;

    formula = 'NOT(REGEXMATCH(ARRAY_CONSTRAIN(' + MONTH_NAME.short[mm] + '!' + tags + '; ' + bsblank + '; 1); "#ign"))';
    formula = 'NOT(ISBLANK(ARRAY_CONSTRAIN(' + MONTH_NAME.short[mm] + '!' + value + '; ' + bsblank + '; 1))); ' + formula;
    formula = 'FILTER(ARRAY_CONSTRAIN(' + MONTH_NAME.short[mm] + '!' + value + '; ' + bsblank + '; 1); ' + formula + ')';
    formula = 'SUM(IFERROR(' + formula + '; 0))';

    return formula;
  }
}
