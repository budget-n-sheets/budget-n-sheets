class FormatTable {
  constructor () {
    this.rangeList = { index: [], range: [] };
  }

  static pick (sheet) {
    const name = sheet.getName();
    switch (name) {
      case 'Cards':
        return new FormatTableCards(sheet);
      case 'Tags':
        return new FormatTableTags(sheet);

      default:
        break;
    }

    const mm = Consts.month_name.short.indexOf(name);
    if (mm === -1) return 1;
    return new FormatTableAccounts(sheet);
  }

  static showWarning () {
    SpreadsheetApp2.getUi().alert(
      "Can't format table",
      'Select a month, Cards or Tags to format the table.',
      SpreadsheetApp2.getUi().ButtonSet.OK);
  }

  set indexes (indexes) {
    this.rangeList.index = this.rangeList.index.concat(indexes);
  }

  set ranges (ranges) {
    this.rangeList.range = this.rangeList.index.concat(ranges);
  }

  filterRanges (ranges) {
    const w = this._specs.width + 1;

    for (const range of ranges) {
      const column = range.getColumn() - 1;

      if (column % w === 0 && range.getNumColumns() === this._specs.width) {
        if (range.getNumRows() > 1) this.rangeList.range.push(range);
      } else {
        const last = range.getLastColumn();
        for (let i = column; i < last; i += w) {
          const index = (i - (i % w)) / w;
          this.rangeList.index.push(index);
        }
      }
    }

    return this;
  }
}
