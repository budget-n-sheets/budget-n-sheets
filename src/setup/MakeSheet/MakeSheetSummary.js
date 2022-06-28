class MakeSheetSummary extends MakeSheet {
  constructor () {
    super(MakeSheetSummary.metadata);
  }

  static get metadata () {
    return {
      id: Info.template.id,
      name: 'Summary',
      requires: ['_Settings', '_Backstage']
    }
  }

  setCharts_ () {
    new SheetSummaryCharts().insertChart1();
  }

  setFormat_ () {
    const sheet = this.sheet;

    sheet.getRange('B2').setValue(`${this._consts.financial_year} | Year Summary`);
    sheet.getRangeList(['D6:I7', 'D9:I20', 'D24:I35']).setNumberFormat(this._settings.number_format);

    sheet.protect().setWarningOnly(true);
    sheet.setTabColor('#e69138');

    this._spreadsheet.setActiveSheet(sheet);
    this._spreadsheet.moveActiveSheet(1);
  }

  setFormulas_ () {
    const formulaBuild = FormulaBuild.summary();
    const sheet = this.sheet;
    const _h = TABLE_DIMENSION.height;

    let makeFormula, formulas;

    makeFormula = formulaBuild.table1();
    formulas = [];
    for (let i = 0; i < 12; i++) {
      formulas[i] = [
        '_Backstage!B' + (3 + _h * i), null,
        makeFormula.expensesMonth(i), null
      ];
    }
    sheet.getRange('D9:G20').setFormulas(formulas);

    makeFormula = formulaBuild.chart1();
    formulas = [[makeFormula.data(0).replace(/""/g, '0')]];
    for (let i = 1; i < 12; i++) {
      formulas[i] = [makeFormula.data(i)];
    }
    sheet.getRange('D24:D35').setFormulas(formulas);
  }

  make () {
    this.setFormat_();
    this.setFormulas_();

    SpreadsheetApp.flush();
    this.setCharts_();
  }

  makeConfig () {
    this._consts.financial_year = SettingsConst.getValueOf('financial_year');

    this._settings.dec_p = SettingsSpreadsheet.getValueOf('decimal_places');
    this._settings.dec_c = (this._settings.dec_p > 0 ? '.' + '0'.repeat(this._settings.dec_p) : '');
    this._settings.number_format = `#,##0${this._settings.dec_c};(#,##0${this._settings.dec_c})`;

    return this;
  }
}
