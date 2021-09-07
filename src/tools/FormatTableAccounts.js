class FormatTableAccounts extends FormatTable {
  constructor (sheet) {
    super();
    this.sheet = sheet;

    this._specs = Object.freeze({
      nullSearch: 3,
      row: 5,
      width: 4
    });
  }

  formatRange_ (range) {
    const column = range.getColumn();

    range.trimWhitespace().sort([
      { column: (0 + column), ascending: true },
      { column: (2 + column), ascending: true }
    ]);

    const snapshot = range.getValues();

    let i = snapshot.findIndex(line => line[0] >= 0);
    if (i === -1) i = snapshot.length;
    if (i < 2) return;

    range.offset(0, 0, i, 4).sort({ column: column, ascending: false });
  }

  format () {
    if (!this.sheet) return;

    const numRows = this.sheet.getLastRow() - this._specs.row + 1;
    if (numRows < 2) return;

    this.rangeList.range.forEach(range => {
      this.formatRange_(range);
    });

    this.rangeList.index.forEach(index => {
      const range = this.sheet.getRange(this._specs.row, 1 + (this._specs.width + 1) * index, numRows, this._specs.width);
      this.formatRange_(range);
    });
  }
}
