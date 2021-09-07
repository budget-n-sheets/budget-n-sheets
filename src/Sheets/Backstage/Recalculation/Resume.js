class ResumeRecalculation extends BackstageRecalculation {
  constructor () {
    super();
    this.spreadsheet = new Spreadsheet2();
    this.formulas = FormulaBuild.backstage();

    this.fastA1 = Object.freeze({
      values: ['C5:C', 'H5:H', 'M5:M', 'R5:R', 'W5:W', 'AB5:AB'],
      tags: ['D5:D', 'I5:I', 'N5:N', 'S5:S', 'X5:X', 'AC5:AC'],
      combo: ['C5:D', 'H5:I', 'M5:N', 'R5:S', 'W5:X', 'AB5:AC'],
      balance1: ['G2', 'L2', 'Q2', 'V2', 'AA2', 'G12', 'L12', 'Q12', 'V12', 'AA12', 'G22', 'L22', 'Q22', 'V22', 'AA22', 'G32', 'L32', 'Q32', 'V32', 'AA32', 'G42', 'L42', 'Q42', 'V42', 'AA42', 'G52', 'L52', 'Q52', 'V52', 'AA52', 'G62', 'L62', 'Q62', 'V62', 'AA62', 'G72', 'L72', 'Q72', 'V72', 'AA72', 'G82', 'L82', 'Q82', 'V82', 'AA82', 'G92', 'L92', 'Q92', 'V92', 'AA92', 'G102', 'L102', 'Q102', 'V102', 'AA102', 'G112', 'L112', 'Q112', 'V112', 'AA112'],
      balance2: ['0', '0', '0', '0', '0', 'G3', 'L3', 'Q3', 'V3', 'AA3', 'G13', 'L13', 'Q13', 'V13', 'AA13', 'G23', 'L23', 'Q23', 'V23', 'AA23', 'G33', 'L33', 'Q33', 'V33', 'AA33', 'G43', 'L43', 'Q43', 'V43', 'AA43', 'G53', 'L53', 'Q53', 'V53', 'AA53', 'G63', 'L63', 'Q63', 'V63', 'AA63', 'G73', 'L73', 'Q73', 'V73', 'AA73', 'G83', 'L83', 'Q83', 'V83', 'AA83', 'G93', 'L93', 'Q93', 'V93', 'AA93', 'G103', 'L103', 'Q103', 'V103', 'AA103'],
      card_total: ['B6', 'B7', 'B16', 'B17', 'B26', 'B27', 'B36', 'B37', 'B46', 'B47', 'B56', 'B57', 'B66', 'B67', 'B76', 'B77', 'B86', 'B87', 'B96', 'B97', 'B106', 'B107', 'B116', 'B117']
    });
  }

  resumeWallet_ () {
    const formulas = this.formulas.wallet();

    const table = new Array(this.height);
    for (let i = 0; i < this.height; i++) {
      table[i] = new Array(this._w).fill(null);
    }

    let mm = this.start - 1;
    while (++mm < this.end) {
      const month = this.spreadsheet.getSheetByName(Consts.month_name.short[mm]);
      if (!month) continue;

      const maxRows = month.getMaxRows();
      if (maxRows < 5) continue;

      const rowOffset = this._h * mm;
      const offset = rowOffset - this.rowOffset;
      const bsblank = RangeUtils.rollA1Notation(this.specs.init.row + rowOffset, 6);

      table[0 + offset][4] = formulas.bsblank(mm, this.fastA1.values[0] + maxRows);
      table[2 + offset][0] = formulas.expensesIgn(maxRows, mm, bsblank);

      let income = '0';
      let expenses = '0';
      for (let k = 0; k < this.num_acc; k++) {
        income += ' + ' + RangeUtils.rollA1Notation(6 + rowOffset, 8 + this._w * k);
        expenses += ' + ' + RangeUtils.rollA1Notation(4 + rowOffset, 7 + this._w * k);
      }

      table[1 + offset][0] = income;
      table[3 + offset][0] = expenses;
    }

    this.clearContent().getGroupRange(this.start, 0, this.end - this.start, 1).setFormulas(table);
  }

  resumeAccounts_ () {
    const formulas = this.formulas.accounts();
    const fastA1 = this.fastA1;

    const table = new Array(this.height);
    for (let i = 0; i < this.height; i++) {
      table[i] = new Array(this._w * this.num_acc).fill(null);
    }

    let mm = this.start - 1;
    while (++mm < this.end) {
      const month = this.spreadsheet.getSheetByName(Consts.month_name.short[mm]);
      if (!month) continue;

      const maxRows = month.getMaxRows();
      if (maxRows < 5) continue;

      const rowOffset = this._h * mm;
      const offset = rowOffset - this.rowOffset;

      for (let k = 0; k < this.num_acc; k++) {
        const columnOffset = this._w * k;
        let formula = '';

        const header = RangeUtils.rollA1Notation(4, 8 + 5 * k);
        const bsblank = RangeUtils.rollA1Notation(2 + this._h * mm, 11 + columnOffset);

        table[0 + offset][0 + columnOffset] = '=' + fastA1.balance2[5 * mm + k];

        formula = formulas.bsreport(mm, fastA1.tags[1 + k] + maxRows, fastA1.combo[1 + k] + maxRows, bsblank);
        table[0 + offset][1 + columnOffset] = formula;

        formula = formulas.bsblank(mm, header, fastA1.values[1 + k] + maxRows);
        table[0 + offset][4 + columnOffset] = formula;

        formula = formulas.balance(mm, fastA1.values[1 + k] + maxRows, fastA1.balance1[5 * mm + k], bsblank);
        table[1 + offset][0 + columnOffset] = formula;

        formula = formulas.expensesIgn(mm, fastA1.values[1 + k] + maxRows, fastA1.tags[1 + k] + maxRows, bsblank);
        table[2 + offset][0 + columnOffset] = formula;
      }
    }

    this.clearContent().getGroupRange(this.start, 1, this.end - this.start, this.num_acc).setFormulas(table);
  }

  resume (start, end) {
    if (end == null) end = 12;
    if (start >= end) return;

    this.start = start;
    this.end = end;

    this.rowOffset = this._h * start;
    this.height = this._h * (end - start);

    this.resumeWallet_();
    this.resumeAccounts_();
  }
}
