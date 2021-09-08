class FormatTableAccounts extends FormatTable {
  constructor (sheet) {
    super();
    this.sheet = sheet;

    const mm = Consts.month_name.short.indexOf(sheet.getName());
    const financial_year = SettingsConst.getValueOf('financial_year');
    this.hasHideRows = (new Date(financial_year, mm + 1, 0) < Consts.date);

    this.specs = Object.freeze({
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

  hideRows_ () {
    let lastRow = this.sheet.getLastRow();
    const maxRows = this.sheet.getMaxRows();

    if (lastRow === maxRows) return;
    if (maxRows <= this._specs.row) return;
    if (lastRow < this._specs.row) lastRow = this._specs.row;

    this.sheet.hideRows(lastRow + 1, maxRows - lastRow);
  }

  format () {
    if (!this.sheet) return;

    const numRows = this.sheet.getLastRow() - this._specs.row + 1;
    if (numRows < 2) return;

    this.rangeList.range.forEach(range => this.formatRange_(range));

    const nill = this._specs.nullSearch - 1;
    for (const index of this.rangeList.index) {
      const range = this.sheet.getRange(
        this._specs.row,
        1 + (this._specs.width + 1) * index,
        numRows,
        this._specs.width);

      let row = range.getValues().findIndex(line => line[nill] === '');
      if (row === -1) row = numRows;
      if (row > 1) this.formatRange_(range.offset(0, 0, row, this._specs.width));
    }

    if (this.hasHideRows && this.rangeList.index.length > 0) this.hideRows_();

    this.rangeList = { index: [], range: [] };
    return this;
  }
}
