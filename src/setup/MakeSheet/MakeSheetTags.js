/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class MakeSheetTags extends MakeSheet {
  constructor () {
    super(MakeSheetTags.metadata);
  }

  static get metadata () {
    return {
      id: Info.template.id,
      name: 'Tags',
      requires: ['TTT']
    }
  }

  setFormat_ () {
    const sheet = this.sheet;

    sheet.getRange('F2:S').setNumberFormat(this._consts.number_format);

    sheet.protect()
      .setUnprotectedRanges([sheet.getRange('A2:E')])
      .setWarningOnly(true);
    sheet.setTabColor('#e69138');
  }

  setFormulas_ () {
    const formulaBuild = FormulaBuild.tags();

    const formulas = Consts.month_name.short.map((m, i) => {
      let numRowsMonth = (SpreadsheetApp2.getActive().getSheetByName(m)?.getMaxRows() || 4) - 4;
      return formulaBuild.table().month(numRowsMonth < 1 ? 1 : numRowsMonth, i);
    });

    this.sheet.getRange('F1:Q1').setFormulas([formulas]);

    this.sheet.getRange('R1').setFormula(formulaBuild.stats().average());
    this.sheet.getRange('S1').setFormula(formulaBuild.stats().total());
  }

  make () {
    this.setFormat_();
    this.setFormulas_();

    SpreadsheetApp.flush();
    this._spreadsheet.setActiveSheet(this.sheet);
  }

  makeConfig () {
    const numberFormat = FormatNumberUtils.getNumberFormat();
    this._consts.number_format = `${numberFormat};(${numberFormat})`;

    return this;
  }
}
