class SuspendRecalculation {
  constructor () {
    this.sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('_Backstage');
    this._h = TABLE_DIMENSION.height;

    this.load = SettingsSpreadsheet.getValueOf('optimize_load');
  }

  suspend (start, end) {
    if (!this.sheet) return;

    if (end == null) end = 12;
    if (start >= end) return;

    const columns = this.sheet.getLastColumn() - 1;
    if (columns < 1) return;

    const range = this.sheet.getRange(2 + this._h * start, 2, this._h * (end - start), columns);
    range.setValues(range.getValues());

    for (let i = start; i < end; i++) {
      this.load[i] = true;
    }
    SettingsSpreadsheet.setValueOf('optimize_load', this.load);

    SpreadsheetApp.flush();
    return this;
  }
}
