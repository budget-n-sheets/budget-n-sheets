class ResumeRecalculation extends SheetBackstageRecalculation {
  constructor () {
    super();

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
      const month = Spreadsheet2.getSheetByName(Consts.month_name.short[mm]);
      if (!month) continue;

      const numRows = month.getMaxRows() - 4;
      if (numRows < 1) continue;

      const rowOffset = this._h * mm;
      const offset = rowOffset - this.rowOffset;
      const bsblank = RangeUtils.rollA1Notation(this.specs.init.row + rowOffset, 6);

      table[0 + offset][4] = formulas.bsblank(mm, this.fastA1.values[0] + numRows);
      table[2 + offset][0] = formulas.expensesIgn(numRows, mm, bsblank);

      let income = '0';
      let expenses = '0';
      for (let k = 0; k < this.num_acc; k++) {
        income += ' + ' + RangeUtils.rollA1Notation(6 + rowOffset, 8 + this._w * k);
        expenses += ' + ' + RangeUtils.rollA1Notation(4 + rowOffset, 7 + this._w * k);
      }

      table[1 + offset][0] = income;
      table[3 + offset][0] = expenses;

      table[4 + offset][0] = RangeUtils.rollA1Notation(4 + rowOffset, 7 + this._w * this.num_acc);
      table[5 + offset][0] = RangeUtils.rollA1Notation(5 + rowOffset, 7 + this._w * this.num_acc);
    }

    this.getGroupRange(this.start, 0, this.end - this.start, 1).clearContent().setFormulas(table);
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
      const month = Spreadsheet2.getSheetByName(Consts.month_name.short[mm]);
      if (!month) continue;

      const maxRows = month.getMaxRows();
      if (maxRows < 1) continue;

      const rowOffset = this._h * mm;
      const offset = rowOffset - this.rowOffset;

      for (let k = 0; k < this.num_acc; k++) {
        const columnOffset = this._w * k;
        let formula = '';

        const header = RangeUtils.rollA1Notation(4, 8 + 5 * k);
        const bsblank = RangeUtils.rollA1Notation(2 + this._h * mm, 11 + columnOffset);

        table[0 + offset][0 + columnOffset] = '=' + fastA1.balance2[5 * mm + k];

        formula = formulas.income(mm, fastA1.values[1 + k] + maxRows, fastA1.tags[1 + k] + maxRows, bsblank);
        table[3 + offset][0 + columnOffset] = formula;

        formula = formulas.reportTag('wd', mm, fastA1.values[1 + k] + maxRows, fastA1.tags[1 + k] + maxRows, bsblank);
        table[0 + offset][1 + columnOffset] = formula[0];
        table[0 + offset][2 + columnOffset] = formula[1];

        formula = formulas.reportTag('dp', mm, fastA1.values[1 + k] + maxRows, fastA1.tags[1 + k] + maxRows, bsblank);
        table[1 + offset][1 + columnOffset] = formula[0];
        table[1 + offset][2 + columnOffset] = formula[1];

        formula = formulas.reportTag('trf+', mm, fastA1.values[1 + k] + maxRows, fastA1.tags[1 + k] + maxRows, bsblank);
        table[2 + offset][1 + columnOffset] = formula[0];
        table[2 + offset][2 + columnOffset] = formula[1];

        formula = formulas.reportTag('trf-', mm, fastA1.values[1 + k] + maxRows, fastA1.tags[1 + k] + maxRows, bsblank);
        table[3 + offset][1 + columnOffset] = formula[0];
        table[3 + offset][2 + columnOffset] = formula[1];

        table[4 + offset][1 + columnOffset] = RangeUtils.rollA1Notation(5 + this._h * mm, 7 + columnOffset);

        formula = formulas.bsblank(mm, header, fastA1.values[1 + k] + maxRows);
        table[0 + offset][4 + columnOffset] = formula;

        formula = formulas.balance(mm, fastA1.values[1 + k] + maxRows, fastA1.balance1[5 * mm + k], bsblank);
        table[1 + offset][0 + columnOffset] = formula;

        formula = formulas.expensesIgn(mm, fastA1.values[1 + k] + maxRows, fastA1.tags[1 + k] + maxRows, bsblank);
        table[2 + offset][0 + columnOffset] = formula;
      }
    }

    this.getGroupRange(this.start, 1, this.end - this.start, this.num_acc).clearContent().setFormulas(table);
  }

  resumeCards_ () {
    const formulas = this.formulas.cards();
    const col = 2 + this._w + this._w * this.num_acc + this._w;

    const sheet = Spreadsheet2.getSheetByName('Cards');
    if (!sheet) return;

    const numRows = sheet.getMaxRows() - 5;
    if (numRows < 1) return;

    const listRange1 = [];
    const listRange2 = [];
    const listRange3 = [];
    const listRange5 = [];

    const table = new Array(this.height);
    for (let i = 0; i < this.height; i++) {
      table[i] = new Array(10 * this._w).fill(null);
    }

    const allBsblank = [];
    for (let i = this.start; i < this.end; i++) {
      allBsblank.push(RangeUtils.rollA1Notation(2 + this._h * i, col - 1));
    }

    const regex = [RangeUtils.rollA1Notation(1, col)];
    for (let k = 1; k < 10; k++) {
      regex[k] = RangeUtils.rollA1Notation(1, col + this._w * k);
    }

    this.getGroupRange(this.start, 1 + this.num_acc, this.end - this.start, 1).clearContent();

    let mm = this.start - 1;
    while (++mm < this.end) {
      const rowOffset = this._h * mm;
      const offset = rowOffset - this.rowOffset;

      this._sheet.getRange(2 + rowOffset, 4 + col - this._w).setFormula(formulas.bsblank(numRows, mm));
      this._sheet.getRange(3 + rowOffset, col - this._w, 4)
        .setFormulaR1C1('RC[5] + RC[10] + RC[15] + RC[20] + RC[25] + RC[30] + RC[35] + RC[40] + RC[45] + RC[50]');
      this._sheet.getRange(4 + rowOffset, col - this._w)
        .setFormulaR1C1('RC[6] + RC[11] + RC[16] + RC[21] + RC[26] + RC[31] + RC[36] + RC[41] + RC[46] + RC[51]');

      const listRange4 = [];
      for (let k = 0; k < 10; k++) {
        const columnOffset = this._w * k;
        const bsblank = RangeUtils.rollA1Notation(2 + rowOffset, 4 + col + columnOffset);

        table[0 + offset][4 + columnOffset] = allBsblank[mm - this.start];
        table[1 + offset][0 + columnOffset] = formulas.credit(numRows, mm, regex[k], bsblank);
        table[2 + offset][0 + columnOffset] = formulas.expensesIgn(numRows, mm, regex[k], bsblank);
        table[3 + offset][0 + columnOffset] = formulas.expenses(numRows, mm, regex[k], bsblank);
        table[3 + offset][1 + columnOffset] = formulas.bscardpart(numRows, mm, RangeUtils.rollA1Notation(1, col + columnOffset), bsblank);

        listRange1.push(RangeUtils.rollA1Notation(6 + rowOffset, 0 + col + columnOffset));
        listRange2.push(RangeUtils.rollA1Notation(6 + rowOffset, 1 + col + columnOffset));
        listRange3.push(RangeUtils.rollA1Notation(3 + rowOffset, 1 + col + columnOffset));
        listRange4[k] = RangeUtils.rollA1Notation(2 + rowOffset, 4 + col + columnOffset);
        listRange5.push(RangeUtils.rollA1Notation(4 + rowOffset, 1 + col + columnOffset));
      }

      this._sheet.getRangeList(listRange4).setFormula(RangeUtils.rollA1Notation(2 + rowOffset, 4 + col - this._w));
    }

    this.getGroupRange(this.start, 2 + this.num_acc, this.end - this.start, 10).clearContent().setFormulas(table);

    this._sheet.getRangeList(listRange1).setFormulaR1C1('R[-1]C + R[-3]C');
    this._sheet.getRangeList(listRange2).setFormulaR1C1('R[-1]C + R[-4]C + RC[-1]');
    this._sheet.getRangeList(listRange3).setFormulaR1C1('MIN(R[-1]C; R[-1]C - R[3]C)');
    this._sheet.getRangeList(listRange5).setFormulaR1C1('RC[-1] + R[-1]C[-1]');
  }

  resumeBalances_ () {
    const actual = MonthFactored.getActual();
    if (this.end >= actual) return;

    const rangeList = [];
    const formulas = this.formulas.accounts();

    let mm = this.start;
    while (++mm < actual) {
      const month = Spreadsheet2.getSheetByName(Consts.month_name.short[mm]);
      if (!month) continue;

      const maxRows = month.getMaxRows();
      if (maxRows < 5) continue;

      const rowOffset = this._h * mm;
      const range = this._sheet.getRange(3 + rowOffset, 2 + this._w);

      for (let k = 0; k < this.num_acc; k++) {
        rangeList.push(RangeUtils.rollA1Notation(2 + rowOffset, 2 + this._w + this._w * k));

        const bsblank = RangeUtils.rollA1Notation(2 + rowOffset, 11 + this._w * k);
        const formula = formulas.balance(mm, this.fastA1.values[1 + k] + maxRows, this.fastA1.balance1[5 * mm + k], bsblank);
        range.offset(0, this._w * k).setFormula(formula);
      }
    }

    this._sheet.getRangeList(rangeList).setFormulaR1C1('R[-' + (this._h - 1) + ']C');
  }

  resumeMisc_ () {
    const formater = new FormatNumber();

    const db_accounts = new AccountsService().getAll();
    for (const id in db_accounts) {
      const account = db_accounts[id];
      if (account.time_start < this.start) continue;

      this._sheet.getRange(
        2 + this._h * account.time_start,
        2 + this._w + this._w * account.index)
        .setFormula(formater.localeSignal(account.balance));
    }

    const col = 3 + this._w * (2 + this.num_acc);
    const db_cards = new CardsService().getAll();
    for (const id in db_cards) {
      const rangeList = [];
      const formula = '=' + formater.localeSignal(db_cards[id].limit);

      for (let mm = this.start; mm < this.end; mm++) {
        rangeList.push(RangeUtils.rollA1Notation(2 + this._h * mm, col + this._w * db_cards[id].index));
      }

      this._sheet.getRangeList(rangeList).setFormula(formula);
    }
  }

  resume (start, end = 12) {
    if (start >= end) return;

    this.start = start;
    this.end = end;

    this.rowOffset = this._h * start;
    this.height = this._h * (end - start);

    this.resumeWallet_();
    this.resumeAccounts_();
    this.resumeCards_();

    this.resumeBalances_();
    this.resumeMisc_();

    for (let i = start; i < end; i++) {
      this.load[i] = false;
    }
    SettingsSpreadsheet.setValueOf('optimize_load', this.load);

    SpreadsheetApp.flush();
    return this;
  }
}
