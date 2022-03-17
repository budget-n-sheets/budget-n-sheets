class SuspendRecalculation extends SheetBackstageRecalculation {
  suspend (start, end = 12) {
    if (start >= end) return;

    const columns = this._sheet.getLastColumn() - 1;
    if (columns < 1) return;

    const range = this.getGroupRange(start, 0, end - start);
    range.setValues(range.getValues());

    for (let i = start; i < end; i++) {
      this.load[i] = true;
    }
    SettingsSpreadsheet.setValueOf('optimize_load', this.load);

    SpreadsheetApp.flush();
    return this;
  }
}
