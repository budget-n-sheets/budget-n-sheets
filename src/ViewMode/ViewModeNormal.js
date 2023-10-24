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
    const formulas = FormulaBuilderTtt.header();

    for (let i = 0; i < 12; i++) {
      const sheet = SpreadsheetApp2.getActive().getSheetByName(Consts.month_name.short[i]);
      if (!sheet) continue;
      if (sheet.getMaxRows() < 4) continue;

      sheet.showRows(2, 3);

      sheet.getRange('E1:F4')
        .merge()
        .setValue('')
        // TODO
        // .setFormula(formulas.report(k, i))
      sheet.getRange(1, 2, 1, 3)
        .setBorder(
          null,null, true, null, null, null,
          '#000000',
          SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
    }

    SpreadsheetApp.flush();
  }

  static set () {
    this.expandTtt_();
  }
}
