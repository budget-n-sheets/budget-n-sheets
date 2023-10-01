/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class ViewModeNormal {
  static expandTtt_ () {
    const formulas = FormulaBuildTtt.header();
    const num_acc = SettingsConst.get('number_accounts');

    for (let i = 0; i < 12; i++) {
      const sheet = SpreadsheetApp2.getActive().getSheetByName(Consts.month_name.short[i]);
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
    this.expandTtt_();
  }
}
