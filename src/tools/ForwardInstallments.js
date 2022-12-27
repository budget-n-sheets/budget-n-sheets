/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class ForwardInstallments {
  constructor () {
    this.sheet = SpreadsheetApp2.getActive().getSheetByName('Cards');

    this.formater = new FormatNumber();

    this.rangeList = { indexes: [], ranges: [] };
    this.specs = Object.freeze({
      nullSearch: 4,
      row: 6,
      width: 5
    });
  }

  static isCompatible (sheet) {
    return sheet.getName() === 'Cards';
  }

  static showWarning () {
    SpreadsheetApp2.getUi().alert(
      "Can't forward installments",
      'Select Cards to forward installments.',
      SpreadsheetApp2.getUi().ButtonSet.OK);
  }

  get indexes () {
    return this.rangeList.indexes;
  }

  set indexes (indexes) {
    this.rangeList.indexes = this.rangeList.indexes.concat(indexes);
  }

  get ranges () {
    return this.rangeList.ranges;
  }

  set ranges (ranges) {
    this.rangeList.ranges = this.rangeList.ranges.concat(ranges);
  }

  forward_ (ranges, steps) {
    if (steps == null) steps = 11;
    if (steps < 1 || steps > 11) return;

    const ledger = new LedgerCards();
    const w = this.specs.width + 1;

    for (const range of ranges) {
      const column = range.getColumn() - 1;
      let mm = (column - (column % w)) / w;
      if (mm > 11) continue;

      const snapshot = range.getValues();

      const installments = this.filterInstallments(snapshot);
      if (installments.length === 0) continue;

      let end = mm + steps + 1;
      if (end > 12) end = 12;

      while (++mm < end && installments.length > 0) {
        const values = this.getNextInstallments(installments);
        ledger.mergeTransactions(mm, values);
      }
    }
  }

  forwardIndexes_ () {
    const numRows = this.sheet.getLastRow() - this.specs.row + 1;
    if (numRows < 1) return;

    const ledger = new LedgerCards();
    const indexes = this.indexes.filter((v, i, s) => s.indexOf(v) === i).sort((a, b) => a - b);

    const nill = this.specs.nullSearch - 1;
    for (const index of indexes) {
      if (index < 0 || index > 10) continue;

      const range = this.sheet.getRange(
        this.specs.row,
        1 + (this.specs.width + 1) * index,
        numRows,
        this.specs.width);

      let row = range.getValues().findIndex(line => line[nill] === '');
      if (row === -1) row = numRows;
      if (row > 0) this.forward_([range.offset(0, 0, row, this.specs.width)], 1);
    }
  }

  filterInstallments (snapshot) {
    const installments = [];

    for (let i = 0; i < snapshot.length; i++) {
      const line = snapshot[i];
      if (line[1] === '') continue;

      const match = line[1].match(/((\d+)\/(\d+))/);
      if (!match) continue;

      const p1 = +match[2];
      const p2 = +match[3];
      if (p1 >= p2) continue;

      if (line[0] > 0) line[0] *= -1;
      line[1] = line[1].trim();
      line[3] = '=' + this.formater.localeSignal(line[3]);

      installments.push({
        line: line,
        reg: match[1],
        p1: p1,
        p2: p2
      });
    }

    return installments;
  }

  forward () {
    if (this.rangeList.ranges.length > 0) this.forward_(this.rangeList.ranges);
    else if (this.rangeList.indexes.length > 0) this.forwardIndexes_();

    SpreadsheetApp.flush();

    this.rangeList = { indexes: [], ranges: [] };
    return this;
  }

  getNextInstallments (installments) {
    const values = [];

    for (let i = 0; i < installments.length; i++) {
      const el = installments[i];

      el.p1++;

      const line = el.line.slice();
      line[1] = line[1].replace(el.reg, el.p1 + '/' + el.p2);

      values.push(line);

      if (el.p1 === el.p2) {
        installments.splice(i, 1);
        i--;
      }
    }

    return values;
  }
}
