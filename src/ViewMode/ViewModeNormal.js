/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class ViewModeNormal {
  static expandCards_ () {
    const sheet = Spreadsheet3.getSheetByName('Cards');
    if (!sheet) return;
    if (sheet.getMaxRows() < 4) return;

    const formulas = FormulaBuildCards.header();

    const _h = TABLE_DIMENSION.height;
    const _w = TABLE_DIMENSION.width;

    const num_acc = SettingsConst.get('number_accounts');
    const col = 2 + _w + _w * num_acc;

    sheet.showRows(3, 2);

    const range = sheet.getRange(2, 4, 3, 2);
    for (let i = 0; i < 12; i++) {
      const index = RangeUtils.rollA1Notation(2, 1 + 6 * i);
      const reference = '_Backstage!' + RangeUtils.rollA1Notation(2 + _h * i, col);
      range.offset(0, 6 * i).merge().setFormula(formulas.report(index, reference));
    }

    SpreadsheetApp.flush();
  }

  static expandTtt_ () {
    const formulas = FormulaBuildTtt.header();
    const num_acc = SettingsConst.get('number_accounts');

    for (let i = 0; i < 12; i++) {
      const sheet = Spreadsheet3.getSheetByName(Consts.month_name.short[i]);
      if (!sheet) continue;
      if (sheet.getMaxRows() < 3) continue;

      sheet.showRows(2, 2);

      let range = sheet.getRange(1, 1, 1, 2);
      range.offset(0, 2, 3, 2)
        .merge()
        .clearContent();
      range.setBorder(null, null, true, null, null, null, '#000000', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

      range = range.offset(0, 5);
      for (let k = 0; k < num_acc; k++) {
        range.offset(0, 2 + 5 * k, 3, 2)
          .merge()
          .setFormula(formulas.report(k, i));
        range.offset(0, 5 * k).setBorder(null, null, true, null, null, null, '#000000', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
      }
    }

    SpreadsheetApp.flush();
  }

  static set () {
    this.expandCards_();
    this.expandTtt_();
  }
}
