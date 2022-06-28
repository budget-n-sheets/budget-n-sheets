class CoolFilterByTag extends CoolGallery {
  constructor () {
    super(CoolFilterByTag.metadata);
  }

  static get metadata () {
    return {
      template_id: '',
      version_name: 'v0.3.0',
      name: 'Filter by Tag',
      description: 'Filter and sort transactions by a selected tag.',
      sheets: ['Filter by Tag']
    };
  }

  buildPart1_ () {
    let formula = '';

    let i = 0;
    while (i < 12) {
      let aux1 = 'ARRAYFORMULA(SPLIT(CONCAT("' + Consts.month_name.short[i] + '-"; ' + Consts.month_name.short[i] + '!' + RangeUtils.rollA1Notation(5, 1, -1, 1) + '); "-"))' + this.dec_p;
      aux1 += Consts.month_name.short[i] + '!' + RangeUtils.rollA1Notation(5, 2, -1, 1) + this.dec_p;
      aux1 += Consts.month_name.short[i] + '!' + RangeUtils.rollA1Notation(5, 5, -1, 1) + this.dec_p;
      aux1 += Consts.month_name.short[i] + '!' + RangeUtils.rollA1Notation(5, 3, -1, 2);

      aux1 = '{' + aux1 + '}; REGEXMATCH(' + Consts.month_name.short[i] + '!' + RangeUtils.rollA1Notation(5, 4, -1, 1) + '; ' + this.header + ')';
      aux1 = 'FILTER(' + aux1 + ')';
      aux1 = 'IFNA(' + aux1 + '; {""' + this.dec_p + '""' + this.dec_p + '""' + this.dec_p + '""' + this.dec_p + '""' + this.dec_p + '""})';
      aux1 = 'SORT(' + aux1 + '; 2; TRUE; 4; TRUE; 5; TRUE); \n';
      formula += aux1;

      for (let k = 0; k < this.num_acc; k++) {
        let aux2 = 'ARRAYFORMULA(SPLIT(CONCAT("' + Consts.month_name.short[i] + '-"; ' + Consts.month_name.short[i] + '!' + RangeUtils.rollA1Notation(5, 6 + 5 * k, -1, 1) + '); "-"))' + this.dec_p;
        aux2 += Consts.month_name.short[i] + '!' + RangeUtils.rollA1Notation(5, 7 + 5 * k, -1, 1) + this.dec_p;
        aux2 += Consts.month_name.short[i] + '!' + RangeUtils.rollA1Notation(5, 10 + 5 * k, -1, 1) + this.dec_p;
        aux2 += Consts.month_name.short[i] + '!' + RangeUtils.rollA1Notation(5, 8 + 5 * k, -1, 2);

        aux2 = '{' + aux2 + '}; REGEXMATCH(' + Consts.month_name.short[i] + '!' + RangeUtils.rollA1Notation(5, 9 + 5 * k, -1, 1) + '; ' + this.header + ')';
        aux2 = 'FILTER(' + aux2 + ')';
        aux2 = 'IFNA(' + aux2 + '; {""' + this.dec_p + '""' + this.dec_p + '""' + this.dec_p + '""' + this.dec_p + '""' + this.dec_p + '""})';
        aux2 = 'SORT(' + aux2 + '; 2; TRUE; 4; TRUE; 5; TRUE); \n';
        formula += aux2;
      }

      let aux3 = 'ARRAYFORMULA(SPLIT(CONCAT("' + Consts.month_name.short[i] + '-"; Cards!' + RangeUtils.rollA1Notation(6, 1 + 6 * i, -1, 1) + '); "-"))' + this.dec_p;
      aux3 += 'Cards!' + RangeUtils.rollA1Notation(6, 2 + 6 * i, -1, 4);

      aux3 = '{' + aux3 + '}; REGEXMATCH(Cards!' + RangeUtils.rollA1Notation(6, 5 + 6 * i, -1, 1) + '; ' + this.header + ')';
      aux3 = 'FILTER(' + aux3 + ')';
      aux3 = 'IFNA(' + aux3 + '; {""' + this.dec_p + '""' + this.dec_p + '""' + this.dec_p + '""' + this.dec_p + '""' + this.dec_p + '""})';
      aux3 = 'SORT(' + aux3 + '; 2; TRUE; 4; TRUE; 5; TRUE); \n';
      formula += aux3;

      i++;
    }

    formula = formula.slice(0, -3);
    formula = 'IF(D8 = ""; ""; QUERY({\n' + formula + '\n}; "select * where Col6 is not null"))';

    this._sheet.getRange('B12').setFormula(formula);
  }

  buildTags_ () {
    const sheet = this._spreadsheet.getSheetByName('Tags');
    if (!sheet) return;

    const numRows = sheet.getMaxRows() - 1;
    if (numRows < 1) return;

    const range = sheet.getRange(2, 5, numRows, 1);
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(range, true)
      .setAllowInvalid(true)
      .build();

    this._sheet.getRange(this.header).setDataValidation(rule);
  }

  make () {
    this.buildPart1_();
    this.buildTags_();

    this._sheet.setTabColor('#e69138');
    return this;
  }

  makeConfig () {
    this._sheet = this._spreadsheet.getSheetByName('Filter by Tag');

    this.num_acc = SettingsConst.getValueOf('number_accounts');
    this.dec_s = SettingsSpreadsheet.getValueOf('decimal_separator');

    this.header = 'D8';
    this.dec_p = (this.dec_s ? ', ' : ' \\ ');

    return this;
  }
}
