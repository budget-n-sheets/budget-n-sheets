/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class CoolTagsByCategory extends CoolGallery {
  constructor () {
    super(CoolTagsByCategory.metadata);
  }

  static get metadata () {
    return {
      id: '',
      name: 'Tags by Category',
      version_name: 'v1.0.0',
      description: 'Group tags by category.',
      requires: ['Tags']
    };
  }

  setAverageFormula_ () {
    let formula;

    formula = 'ARRAYFORMULA(IF(A2:A <> ""; $O$2:$O/_Settings!B6; ))';
    formula = `IF(_Settings!\$B\$6 > 0; ${formula}; ARRAYFORMULA(\$B\$2:\$B * 0))`;
    formula = `IF(_Settings!\$B\$7 > 0; ${formula}; "")`;
    formula = `{"average"; ${formula}}`;

    this.sheet.getRange('N1').setFormula(formula);
  }

  setFormat_ () {
    const num_format = this._consts.number_format;
    this.sheet.getRange('B2:O').setNumberFormat(`${num_format};(${num_format})`);
  }

  setQuery_ () {
    let formula;

    formula = "SELECT Col1, SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col8), SUM(Col9), SUM(Col10), SUM(Col11), SUM(Col12), SUM(Col13), SUM(Col14), SUM(Col15), SUM(Col16) ";
    formula += "WHERE Col1 <> '' AND Col3 = true AND Col4 <> '' ";
    formula += "GROUP BY Col1 ";
    formula += "LABEL Col1 '', ";
    formula += Consts.month_name.long
      .map((m, i) => `SUM(Col${5 + i}) '', `)
      .join('')
      .slice(0, -2);

    this.sheet.getRange('A2').setFormula(`IFERROR(QUERY({Tags!$B$1:$Q}, "${formula}"); )`);
  }

  setTotalFormula_ () {
    let formula;

    formula = 'IF(COLUMN(B2:M) - 1 < _Settings!$B$4 + _Settings!$B$6; ROW(B2:B); 0)';
    formula = `IF(COLUMN(B2:M) - 1 >= _Settings!\$B\$4; ${formula}; 0)`;
    formula = `ARRAYFORMULA(IF(A2:A <> ""; SUMIF(${formula}; ROW(B2:B); B2:B); ))`;
    formula = `IF(_Settings!\$B\$6 > 0; ${formula}; ARRAYFORMULA(\$B\$2:\$B * 0))`;
    formula = `IF(_Settings!\$B\$7 > 0; ${formula}; "")`;
    formula = `{"total"; ${formula}}`;

    this.sheet.getRange('O1').setFormula(formula);
  }

  fixDependencies () {
    new MakeSheetTags().reinstall();
  }

  make () {
    this.setFormat_();
    this.setAverageFormula_();
    this.setTotalFormula_();
    this.setQuery_();

    this.sheet.protect().setWarningOnly(true);
    this.sheet.setTabColor('#e69138');
    return this;
  }

  makeConfig () {
    this._consts.number_format = FormatNumberUtils.getNumberFormat();

    return this;
  }
}
