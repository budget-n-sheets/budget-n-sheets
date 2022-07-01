class MakeSheetTags extends MakeSheet {
  constructor () {
    super(MakeSheetTags.metadata);
  }

  static get metadata () {
    return {
      id: Info.template.id,
      name: 'Tags',
      requires: ['TTT', 'Cards']
    }
  }

  setFormat_ () {
    const sheet = this.sheet;
    const maxRows = sheet.getMaxRows() - 1;

    sheet.getRange(2, 6, maxRows, 12).setNumberFormat(this._settings.number_format);

    sheet.protect()
      .setUnprotectedRanges([sheet.getRange(2, 1, maxRows, 5)])
      .setWarningOnly(true);
    sheet.setTabColor('#e69138');
  }

  setFormulas_ () {
    const build = FormulaBuild.tags().table();

    let numRowsCards = (Spreadsheet2.getSheetByName('Cards')?.getMaxRows() || 5) - 5;
    if (numRowsCards < 1) numRowsCards = 1;

    const formulas = Consts.month_name.short.map((m, i) => {
      let numRowsMonth = (Spreadsheet2.getSheetByName(m)?.getMaxRows() || 4) - 4;
      return build.month(numRowsMonth < 1 ? 1 : numRowsMonth, numRowsCards, i);
    });

    this.sheet.getRange('F1:Q1').setFormulas(formulas);
  }

  make () {
    this.setFormat_();
    this.setFormulas_();

    SpreadsheetApp.flush();
    this._spreadsheet.setActiveSheet(this.sheet);
  }

  makeConfig () {
    this._consts.maxRows = this.sheet.getMaxRows() - 1;
    this._consts.financial_year = SettingsConst.getValueOf('financial_year');

    this._settings.dec_p = SettingsSpreadsheet.getValueOf('decimal_places');
    this._settings.dec_c = (this._settings.dec_p > 0 ? '.' + '0'.repeat(this._settings.dec_p) : '');
    this._settings.number_format = `#,##0${this._settings.dec_c};(#,##0${this._settings.dec_c})`;

    return this;
  }
}
