/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class ForwardInstallments {
  constructor (mm) {
    const name = Consts.month_name.short[mm]
    this.mm = mm
    this.sheet = SpreadsheetApp2.getActive().getSheetByName(name)

    this.formater = new FormatNumber();

    this.rangeList = { indexes: [], ranges: [] };
    this.specs = Object.freeze({
      columnOffset: 1,
      nullSearch: 4,
      row: 5,
      width: 6
    });
  }

  static pick (sheet) {
    const mm = Consts.month_name.short.indexOf(sheet.getName())
    if (mm === -1) return 1
    return new ForwardInstallments(mm)
  }

  static isCompatible (sheet) {
    return Consts.month_name.short.indexOf(sheet.getName()) > -1
  }

  static showWarning () {
    SpreadsheetApp2.getUi().alert(
      "Can't forward installments",
      'Select a month to forward installments.',
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

    for (const range of ranges) {
      let mm = +this.mm
      if (mm > 11) continue;

      const snapshot = range.getValues();

      const installments = this.filterInstallments(snapshot);
      if (installments.length === 0) continue;

      let end = mm + steps + 1;
      if (end > 12) end = 12;

      while (++mm < end && installments.length > 0) {
        const values = this.getNextInstallments(installments);
        new LedgerTtt(mm).mergeTransactions(values);
      }
    }
  }

  forwardIndexes_ () {
    const numRows = this.sheet.getMaxRows() - this.specs.row + 1;
    if (numRows < 1) return;

    const indexes = this.indexes.filter((v, i, s) => s.indexOf(v) === i).sort((a, b) => a - b);

    const range = this.sheet.getRange(
      this.specs.row, 1 + this.specs.columnOffset,
      numRows, this.specs.width)

    const nill = this.specs.nullSearch - 1
    let row = range.getValues().findIndex(line => line[nill] === '')
    if (row === -1) row = numRows
    if (row > 0) this.forward_([range.offset(0, 0, row, this.specs.width)], 1)
  }

  filterInstallments (snapshot) {
    const installments = [];

    for (let i = 0; i < snapshot.length; i++) {
      const line = snapshot[i];
      if (line[2] === '') continue;

      const match = line[2].match(/((\d+)\/(\d+))/);
      if (!match) continue;

      const p1 = +match[2];
      const p2 = +match[3];
      if (p1 >= p2) continue;

      if (line[1] > 0) line[1] *= -1;
      line[2] = line[2].trim();
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
    if (!this.sheet) return

    if (this.indexes.length === 0) {
      for (const range of this.ranges) {
        this.forward_([range])
      }
      return
    }

    this.forwardIndexes_()

    this.rangeList = { indexes: [], ranges: [] }
    return this
  }

  getNextInstallments (installments) {
    const values = [];

    for (let i = 0; i < installments.length; i++) {
      const el = installments[i];

      el.p1++;

      const line = el.line.slice();
      line[2] = line[2].replace(el.reg, el.p1 + '/' + el.p2);

      values.push(line);

      if (el.p1 === el.p2) {
        installments.splice(i, 1);
        i--;
      }
    }

    return values;
  }
}
