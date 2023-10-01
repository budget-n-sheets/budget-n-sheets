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
    const num_acc = SettingsConst.get('number_accounts');

    for (let i = 0; i < 12; i++) {
      const sheet = SpreadsheetApp2.getActive().getSheetByName(Consts.month_name.short[i]);
      if (!sheet) continue;
      if (sheet.getMaxRows() < 3) continue;

      let range = sheet.getRange(1, 3, 1, 2);
      range.offset(0, 0, 3, 2).breakApart();
      range.merge().setFormulaR1C1('R[2]C[-2]');
      range.offset(0, -2).setBorder(null, null, false, null, null, null);

      range = sheet.getRange(1, 8, 1, 2);
      for (let k = 0; k < num_acc; k++) {
        range.offset(0, 5 * k, 3, 2).breakApart();
        range.offset(0, 5 * k)
          .merge()
          .setFormulaR1C1('R[2]C[-2]');
        range.offset(0, -2 + 5 * k).setBorder(null, null, false, null, null, null);
      }

      sheet.hideRows(2, 2);
    }

    SpreadsheetApp.flush();
  }

  static set () {
    this.compactTtt_();
  }
}
