/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class FormatTableCards extends FormatTable {
  constructor () {
    super();
    this.sheet = SpreadsheetApp2.getActive().getSheetByName('Cards');

    this.specs = Object.freeze({
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
      const code = snapshot[p][2];

      let i = snapshot.slice(p).findIndex(line => line[2] !== code || line[0] >= 0);
      if (i === -1) i = snapshot.length - p;

      if (i > 1) range.offset(p, 0, i, 5).sort({ column: column, ascending: false });

      p += i;
      i = snapshot.slice(p).findIndex(line => line[2] !== code);
      p += (i === -1 ? snapshot.length - p : i);
    }
  }

  format () {
    if (!this.sheet) return;

    const numRows = this.sheet.getLastRow() - this.specs.row + 1;
    if (numRows < 2) return;

    for (const range of this.rangeList.ranges) {
      if (range.getNumRows() > 1) this.formatRange_(range);
    }

    const nill = this.specs.nullSearch - 1;
    for (const index of this.rangeList.indexes) {
      if (index < 0 || index > 11) continue;

      const range = this.sheet.getRange(
        this.specs.row,
        1 + (this.specs.width + 1) * index,
        numRows,
        this.specs.width);

      let row = range.getValues().findIndex(line => line[nill] === '');
      if (row === -1) row = numRows;
      if (row > 1) this.formatRange_(range.offset(0, 0, row, this.specs.width));
    }

    this.rangeList = { indexes: [], ranges: [] };
    return this;
  }
}
