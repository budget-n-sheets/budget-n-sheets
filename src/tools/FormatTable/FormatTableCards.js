class FormatTableCards extends FormatTable {
  constructor (sheet) {
    super();
    this.sheet = sheet || SpreadsheetApp2.getActive().getSheetByName('Cards');
    this.numRows = 0;

    this._specs = Object.freeze({
      nullSearch: 4,
      row: 6,
      width: 5
    });
  }

  formatRange_ (range) {
    const column = range.getColumn();

    range.trimWhitespace().sort([
      { column: (2 + column), ascending: true },
      { column: (0 + column), ascending: true },
      { column: (3 + column), ascending: true }
    ]);

    const snapshot = range.getValues();

    let p = 0;
    while (p < snapshot.length) {
      p += t;
      const code = snapshot[p][2];

      let i = snapshot.slice(p).findIndex(line => line[2] !== code || line[0] >= 0);
      if (i === -1) i = snapshot.length - p;

      if (i - p > 1) range.offset(p, 0, i - p, 5).sort({ column: column, ascending: false });

      p += i;
      i = snapshot.slice(p).findIndex(line => line[2] !== code);
      p += (i === -1 ? snapshot.length - p : i);
    }
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
