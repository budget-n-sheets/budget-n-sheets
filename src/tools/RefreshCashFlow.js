class RefreshCashFlow {
  constructor () {
    this.sheet = Spreadsheet2.getSheetByName('Cash Flow');

    this.indexes = new Array(12).fill(false);
    this.specs = Object.freeze({
      row: 4,
      width: 3
    });
  }

  static isCompatible (sheet) {
    const name = sheet.getName();

    if (name === 'Cash Flow') return true;
    return Consts.month_name.short.indexOf(name) > -1;
  }

  static showWarning () {
    SpreadsheetApp2.getUi().alert(
      "Can't refresh cash flow",
      'Select a month or Cash Flow to refresh the flow.',
      SpreadsheetApp2.getUi().ButtonSet.OK);
  }

  filterRanges (ranges) {
    const name = ranges[0].getSheet().getSheetName();

    if (name === 'Cash Flow') {
      const w = specs.width + 1;

      for (const range of ranges) {
        const column = range.getColumn() - 1;
        const last = range.getLastColumn();

        for (let i = column; i < last; i += w) {
          const index = (i - (i % w)) / w;
          this.indexes[index] = true;
        }
      }
    } else {
      const mm = Consts.month_name.short.indexOf(name);
      if (mm === -1) return;
      this.indexes[mm] = true;
    }
  }
}
