class CoolTagsByCategory extends CoolGallery {
  constructor () {
    super(CoolTagsByCategory.metadata);
  }

  static get metadata () {
    return {
      template_id: '',
      version_name: 'v0.1.2',
      name: 'Tags by Category',
      description: 'Group tags by category.',
      sheets: ['Tags by Category'],
      requires: ['Tags']
    };
  }

  setAverageFormula_ () {
    let formula;

    formula = 'ARRAYFORMULA(IF(A2:A <> ""; $O$2:$O/_Settings!B6; ))';
    formula = `IF(_Settings!\$B\$6 > 0; ${formula}; ARRAYFORMULA(\$B\$2:\$B * 0))`;
    formula = `IF(_Settings!\$B\$7 > 0; ${formula}; "")`;
    formula = `{"average"; ${formula}}`;

    this._sheet.getRange('N1').setFormula(formula);
  }

  setQuery_ () {
    let formula;

    formula = "SELECT Col1, SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col8), SUM(Col9), SUM(Col10), SUM(Col11), SUM(Col12), SUM(Col13), SUM(Col14), SUM(Col15), SUM(Col16) ";
    formula += "WHERE Col1 <> '' AND Col3 = true AND Col4 <> '' ";
    formula += "GROUP BY Col1 ";
    formula += "LABEL Col1 'category', ";
    formula += Consts.month_name.long
      .map((m, i) => `SUM(Col${5 + i}) '${m.toLowerCase()}', `)
      .join('')
      .slice(0, -2);

    this._sheet.getRange('A1').setFormula(`IFERROR(QUERY({Tags!$B$1:$Q}, "${formula}"); )`);
  }

  setTotalFormula_ () {
    let formula;

    formula = 'IF(COLUMN(B2:M) - 1 < _Settings!$B$4 + _Settings!$B$6; ROW(B2:B); 0)';
    formula = `IF(COLUMN(B2:M) - 1 >= _Settings!\$B\$4; ${formula}; 0)`;
    formula = `ARRAYFORMULA(IF(A2:A <> ""; SUMIF(${formula}; ROW(B2:B); B2:B); ))`;
    formula = `IF(_Settings!\$B\$6 > 0; ${formula}; ARRAYFORMULA(\$B\$2:\$B * 0))`;
    formula = `IF(_Settings!\$B\$7 > 0; ${formula}; "")`;
    formula = `{"total"; ${formula}}`;

    this._sheet.getRange('O1').setFormula(formula);
  }

  make () {
    this.setQuery_();
    this.setAverageFormula_();
    this.setTotalFormula_();

    this._sheet.protect().setWarningOnly(true);
    this._sheet.setTabColor('#e69138');
    return this;
  }

  makeConfig () {
    this._sheet = this._spreadsheet.getSheetByName('Tags by Category');
    return this;
  }
}
