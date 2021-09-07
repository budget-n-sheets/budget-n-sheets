class SuspendRecalculation extends BackstageRecalculation {
  constructor () {
    super();
  }

  suspend (start, end) {
    if (!this.sheet) return;

    if (end == null) end = 12;
    if (start >= end) return;

    const columns = this.sheet.getLastColumn() - 1;
    if (columns < 1) return;

    const range = this.getMonthRange(start, end);
    range.setValues(range.getValues());

    for (let i = start; i < end; i++) {
      this.load[i] = true;
    }
    SettingsSpreadsheet.setValueOf('optimize_load', this.load);

    SpreadsheetApp.flush();
    return this;
  }
}
