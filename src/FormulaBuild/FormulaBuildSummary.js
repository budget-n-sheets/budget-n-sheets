class FormulaBuildSummary {
  static table1 () {
    return FormulaBuildSummaryTable1;
  }

  static chart1 () {
    return FormulaBuildSummaryChart1;
  }

  static table2 () {
    return FormulaBuildSummaryTable2;
  }

  static table3 () {
    return FormulaBuildSummaryTable3;
  }

  static chart3 () {
    return FormulaBuildSummaryChart3;
  }
}

class FormulaBuildSummaryTable1 {
  static income () {
    return 'IF(_Settings!$B6 > 0;  {SUM(OFFSET($D10; _Settings!$B4; 0; _Settings!$B6; 1)); AVERAGE(OFFSET($D10; _Settings!$B4; 0; _Settings!$B6; 1))}; {0; 0})';
  }

  static expenses () {
    return 'IF(_Settings!$B6 > 0;  {SUM(OFFSET($F10; _Settings!$B4; 0; _Settings!$B6; 1)); AVERAGE(OFFSET($F10; _Settings!$B4; 0; _Settings!$B6; 1))}; {0; 0})';
  }

  static expensesMonth (mm) {
    const _h = TABLE_DIMENSION.height;

    const formula = 'SUM(_Backstage!$B' + (4 + _h * mm) + ':$B' + (6 + _h * mm) + ')';

    return formula;
  }
}

class FormulaBuildSummaryChart1 {
  static load_ () {
    this._settings = RapidAccess.properties().spreadsheet();
  }

  static data (mm) {
    this.load_();

    const dec_s = this._settings.decimal_separator ? ',' : '\\';

    const income = RangeUtils.rollA1Notation(11 + mm, 4);
    const expenses = RangeUtils.rollA1Notation(11 + mm, 6);

    return 'IF(OR(ROW() - 24 < $M$3; ROW() - 24 > $M$3 - 1 + $M$4); {' + income + dec_s + ' -' + expenses + dec_s + ' ""' + dec_s + ' ""}; {""' + dec_s + ' ""' + dec_s + ' ' + income + dec_s + ' -' + expenses + '})';
  }
}

class FormulaBuildSummaryTable2 {
  static data () {
    return 'IF(AND(E52 > 0; _Settings!B7 > 0); QUERY({Tags!$B$1:$T}; "select Col1, sum(Col18), -1 * sum(Col"&(4 + E52)&") where Col3=true or Col3=\'TRUE\' group by Col1 label Col1 \'\', -1 * sum(Col"&(4 + E52)&") \'\', sum(Col18) \'\'"); )';
  }
}

class FormulaBuildSummaryTable3 {
  static share () {
    let formula;

    formula = 'NOT(ISBLANK(D75:D86)) * (ROW(D75:D86) - 74 >= $M$3) * (ROW(D75:D86) - 74 <= $M$3 - 1 + $M$4)';
    formula = 'IF(B72 <> ""; ARRAYFORMULA(IF(' + formula + '; D75:D86/$D$87; 0)); )';

    return formula;
  }

  static total () {
    return 'IF(AND(E52 > 0; _Settings!B7 > 0); INDEX(TRANSPOSE(QUERY({Tags!$B$1:$T}; "select -1 * sum(Col5), -1 * sum(Col6), -1 * sum(Col7), -1 * sum(Col8), -1 * sum(Col9), -1 * sum(Col10), -1 * sum(Col11), -1 * sum(Col12), -1 * sum(Col13), -1 * sum(Col14), -1 * sum(Col15), -1 * sum(Col16) where Col1=\'"&B72&"\' and (Col3=true or Col3=\'TRUE\') group by Col1")); 0; 2); )';
  }
}

class FormulaBuildSummaryChart3 {
  static load_ () {
    this._settings = RapidAccess.properties().spreadsheet();
  }

  static data (mm) {
    this.load_();

    const dec_s = this._settings.decimal_separator ? ',' : '\\';

    return 'IF(OR(ROW() - 74 < $M$3; ROW() - 74 > $M$3 - 1 + $M$4); {' + RangeUtils.rollA1Notation(75 + mm, 4) + dec_s + ' ""}; {""' + dec_s + ' ' + RangeUtils.rollA1Notation(75 + mm, 4) + '})';
  }
}
