class FormatTable {
  constructor () {
    this.rangeList = { index: [], range: [] };
  }

  static pick (sheet) {
    const name = sheet.getName();
    switch (name) {
      case 'Tags':
        return new FormatTableTags(sheet);

      default:
        return 1;
    }
  }

  static showWarning () {
    SpreadsheetApp2.getUi().alert(
      "Can't format table",
      'Select a month, Cards or Tags to format the table.',
      SpreadsheetApp2.getUi().ButtonSet.OK);
  }

  setRanges (ranges) {
    this.rangeList = { index: [], range: [] };
    const w = this._specs.width + 1;

    ranges.forEach(range => {
      let index = range.getColumn() - 1;

      if (index % w === 0 && range.getNumColumns() === this._specs.width) {
        if (range.getNumRows() > 1) this.rangeList.range.push(range);
      } else {
        index = (index - (index % w)) / w;
        this.rangeList.index.push(index);
      }
    });

    return this;
  }
}
