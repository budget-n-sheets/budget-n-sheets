class CoolFilterByTag extends CoolGallery {
  constructor () {
    super(CoolFilterByTag.metadata);
  }

  static get metadata () {
    return {
      id: '',
      name: 'Filter by Tag',
      version_name: 'v1.0.0',
      description: 'Filter and sort transactions by a selected tag.'
    };
  }

  setDataValidation_ () {
    const sheet = this._spreadsheet.getSheetByName('_Unique');
    if (!sheet) return;

    const range = sheet.getRange('$D$1:$D');
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(range, true)
      .setAllowInvalid(true)
      .build();

    this.sheet.getRange(this._consts.header).setDataValidation(rule);
  }

  setFormat_ () {
    const num_format = this._consts.number_format;
    this.sheet.getRange('F6:F').setNumberFormat(`${num_format};(${num_format})`);
  }

  setQuery_ () {
    let formula = '';

    let i = 0;
    while (i < 12) {
      let aux1 = 'ARRAYFORMULA(SPLIT(CONCAT("' + Consts.month_name.short[i] + '-"; ' + Consts.month_name.short[i] + '!' + RangeUtils.rollA1Notation(5, 1, -1, 1) + '); "-"))' + this._settings.dec_p;
      aux1 += Consts.month_name.short[i] + '!' + RangeUtils.rollA1Notation(5, 2, -1, 1) + this._settings.dec_p;
      aux1 += Consts.month_name.short[i] + '!' + RangeUtils.rollA1Notation(5, 5, -1, 1) + this._settings.dec_p;
      aux1 += Consts.month_name.short[i] + '!' + RangeUtils.rollA1Notation(5, 3, -1, 2);

      aux1 = '{' + aux1 + '}; REGEXMATCH(' + Consts.month_name.short[i] + '!' + RangeUtils.rollA1Notation(5, 4, -1, 1) + '; ' + this._consts.header + ')';
      aux1 = 'FILTER(' + aux1 + ')';
      aux1 = 'IFNA(' + aux1 + '; {""' + this._settings.dec_p + '""' + this._settings.dec_p + '""' + this._settings.dec_p + '""' + this._settings.dec_p + '""' + this._settings.dec_p + '""})';
      aux1 = 'SORT(' + aux1 + '; 2; TRUE; 4; TRUE; 5; TRUE); \n';
      formula += aux1;

      for (let k = 0; k < this._consts.num_acc; k++) {
        let aux2 = 'ARRAYFORMULA(SPLIT(CONCAT("' + Consts.month_name.short[i] + '-"; ' + Consts.month_name.short[i] + '!' + RangeUtils.rollA1Notation(5, 6 + 5 * k, -1, 1) + '); "-"))' + this._settings.dec_p;
        aux2 += Consts.month_name.short[i] + '!' + RangeUtils.rollA1Notation(5, 7 + 5 * k, -1, 1) + this._settings.dec_p;
        aux2 += Consts.month_name.short[i] + '!' + RangeUtils.rollA1Notation(5, 10 + 5 * k, -1, 1) + this._settings.dec_p;
        aux2 += Consts.month_name.short[i] + '!' + RangeUtils.rollA1Notation(5, 8 + 5 * k, -1, 2);

        aux2 = '{' + aux2 + '}; REGEXMATCH(' + Consts.month_name.short[i] + '!' + RangeUtils.rollA1Notation(5, 9 + 5 * k, -1, 1) + '; ' + this._consts.header + ')';
        aux2 = 'FILTER(' + aux2 + ')';
        aux2 = 'IFNA(' + aux2 + '; {""' + this._settings.dec_p + '""' + this._settings.dec_p + '""' + this._settings.dec_p + '""' + this._settings.dec_p + '""' + this._settings.dec_p + '""})';
        aux2 = 'SORT(' + aux2 + '; 2; TRUE; 4; TRUE; 5; TRUE); \n';
        formula += aux2;
      }

      let aux3 = 'ARRAYFORMULA(SPLIT(CONCAT("' + Consts.month_name.short[i] + '-"; Cards!' + RangeUtils.rollA1Notation(6, 1 + 6 * i, -1, 1) + '); "-"))' + this._settings.dec_p;
      aux3 += 'Cards!' + RangeUtils.rollA1Notation(6, 2 + 6 * i, -1, 4);

      aux3 = '{' + aux3 + '}; REGEXMATCH(Cards!' + RangeUtils.rollA1Notation(6, 5 + 6 * i, -1, 1) + '; ' + this._consts.header + ')';
      aux3 = 'FILTER(' + aux3 + ')';
      aux3 = 'IFNA(' + aux3 + '; {""' + this._settings.dec_p + '""' + this._settings.dec_p + '""' + this._settings.dec_p + '""' + this._settings.dec_p + '""' + this._settings.dec_p + '""})';
      aux3 = 'SORT(' + aux3 + '; 2; TRUE; 4; TRUE; 5; TRUE); \n';
      formula += aux3;

      i++;
    }

    formula = `IF(D3 = ""; ; IFERROR(QUERY({\n${formula.slice(0, -3)}\n}; "SELECT * WHERE Col6 IS NOT NULL"); ))`;
    this.sheet.getRange('B6').setFormula(formula);
  }

  make () {
    this.setFormat_();
    this.setDataValidation_();
    this.setQuery_();

    const sheet = this.sheet;
    sheet.protect()
      .setUnprotectedRanges([sheet.getRange('D3:F3')])
      .setWarningOnly(true);
    sheet.setTabColor('#e69138');
    return this;
  }

  makeConfig () {
    this._consts.header = 'D3';
    this._consts.num_acc = SettingsConst.getValueOf('number_accounts');
    this._consts.number_format = FormatNumberUtils.getNumberFormat();

    this._settings.dec_s = SettingsSpreadsheet.getValueOf('decimal_separator');
    this._settings.dec_p = (this._settings.dec_s ? ', ' : ' \\ ');

    return this;
  }
}
