/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class ViewModeCompact {
  static compactTtt_ () {
    for (let i = 0; i < 12; i++) {
      const sheet = SpreadsheetApp2.getActive().getSheetByName(Consts.month_name.short[i])
      if (!sheet) continue
      if (sheet.getMaxRows() < 4) continue

      sheet.getRange(1, 5, 4, 2)
        .breakApart()
        .offset(0, 0, 1, 2)
        .merge()
        .setFormulaR1C1('R[2]C[-3]')
      sheet.getRange(1, 2, 1, 3).setBorder(null, null, false, null, null, null)
      sheet.hideRows(2, 3)
    }

    SpreadsheetApp.flush()
  }

  static set () {
    this.compactTtt_()
  }
}
