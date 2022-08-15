class ViewModeCompact {
  static compactCards_ () {
    const sheet = Spreadsheet2.getSheetByName('Cards');
    if (!sheet) return;
    if (sheet.getMaxRows() < 4) return;

    const _h = TABLE_DIMENSION.height;
    const _w = TABLE_DIMENSION.width;

    const num_acc = SettingsConst.get('number_accounts');
    const col = 2 + _w + _w * num_acc;

    const range = sheet.getRange(2, 4, 1, 2);
    for (let i = 0; i < 12; i++) {
      const head = RangeUtils.rollA1Notation(2, 1 + 6 * i);
      const cell = '_Backstage!' + RangeUtils.rollA1Notation(2 + _h * i, col);

      let formula = 'OFFSET(' + cell + '; 4; 5*' + head + '; 1; 1)';
      formula = '"Balance: "; TEXT(' + formula + '; "#,##0.00;(#,##0.00)")';

      range.offset(0, 6 * i, 3, 2).breakApart();
      range.offset(0, 6 * i)
        .merge()
        .setFormula('CONCATENATE(' + formula + ')');
    }

    sheet.hideRows(3, 2);
    SpreadsheetApp.flush();
  }

  static compactTtt_ () {
    const num_acc = SettingsConst.get('number_accounts');

    for (let i = 0; i < 12; i++) {
      const sheet = Spreadsheet2.getSheetByName(Consts.month_name.short[i]);
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
    this.compactCards_();
    this.compactTtt_();
  }
}
