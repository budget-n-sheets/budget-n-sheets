/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class RefreshCashFlow {
  constructor () {
    this.sheet = SpreadsheetApp2.getActive().getSheetByName('Cash Flow');

    this.formater = new FormatNumber();

    this.dec_p = SettingsSpreadsheet.get('decimal_separator');
    this.num_acc = SettingsConst.get('number_accounts');
    this.financial_year = SettingsConst.get('financial_year');

    this.db_cards = new CardsService().getAllBalances() || {};

    this.values = {};

    this.arrayMm = new Array(12).fill(false);
    this.specs = Object.freeze({
      cash_flow: {
        row: 4,
        width: 3
      },
      ttt: {
        nullSearch: 3,
        row: 5,
        width: 4
      }
    });
  }

  static isCompatible (sheet) {
    const name = sheet.getName();

    if (name === 'Cash Flow') return true;
    return Consts.month_name.short.indexOf(name) > -1;
  }

  get indexes () {
    return this.arrayMm;
  }

  set indexes (indexes) {
    this.arrayMm = indexes;
  }

  static showWarning () {
    SpreadsheetApp2.getUi().alert(
      "Can't refresh cash flow",
      'Select a month or Cash Flow to refresh the flow.',
      SpreadsheetApp2.getUi().ButtonSet.OK);
  }

  readCalendarTransactions_ () {
    const finCal = new FinCal();
    const upcoming = finCal.getUpcomingMonthEvents(this.mm);
    const events = CalendarUtils.digestEvents(upcoming);

    const startDate = new Date(this.financial_year, this.mm, 1);
    const endDate = new Date(this.financial_year, this.mm + 1, 1);

    for (const ev of events) {
      if (ev.description === '') continue;
      if (ev.hasAtMute) continue;

      let value = ev.value || 0;

      if (isNaN(ev.value)) {
        if (!ev.hasQcc) continue;
        if (!ev.card) continue;
        if (!ev.hasWallet && !ev.account) continue;

        if (this.mm > 0) {
          const card = this.db_cards[ev.card.id];
          value = card.balances[this.mm - 1];
        }
      } else if (!ev.account) {
        continue;
      }

      value = this.formater.localeSignal(value);
      const title = '@' + ev.title + ' ';

      const first = ev.startDate < startDate ? 0 : ev.startDate.getDate() - 1;
      const last = ev.endDate >= endDate ? this.dd : ev.endDate.getDate() - 1;

      for (let day = first; day < last; day++) {
        this.values.flow[day] += value;
        this.values.transactions[day] += title;
      }
    }
  }

  readTttTransactions_ () {
    const sheet = SpreadsheetApp2.getActive().getSheetByName(Consts.month_name.short[this.mm]);
    if (!sheet) return;

    const numRows = sheet.getLastRow() - this.specs.ttt.row + 1;
    if (numRows < 1) return;

    const snapshot = sheet.getRange(
      this.specs.ttt.row,
      1 + this.specs.ttt.width + 1,
      numRows,
      (this.specs.ttt.width + 1) * this.num_acc
    ).getValues();

    let k = 0;
    let i = -1;
    let c = 0;

    while (k < this.num_acc) {
      i++;
      const line = snapshot[i];

      if (i >= numRows || line[2 + c] === '') {
        k++;
        c += this.specs.ttt.width + 1;
        i = -1;
        continue;
      }

      let day = +line[0 + c];
      if (day <= 0 || day > this.dd) continue;

      const value = line[2 + c];

      day--;
      this.values.flow[day] += this.formater.localeSignal(value);
      this.values.transactions[day] += '@' + line[1 + c] + ' ';
    }
  }

  filterRanges (ranges) {
    const name = ranges[0].getSheet().getSheetName();

    if (name === 'Cash Flow') {
      const w = this.specs.cash_flow.width + 1;

      for (const range of ranges) {
        const column = range.getColumn() - 2;
        const last = range.getLastColumn() - 2;

        const start = (column - (column % w)) / w;
        const end = (last - (last % w)) / w;

        for (let i = start; i <= end; i++) {
          this.arrayMm[i] = true;
        }
      }
    } else {
      const mm = Consts.month_name.short.indexOf(name);
      if (mm === -1) return;
      this.arrayMm[mm] = true;
    }

    return this;
  }

  refresh () {
    for (let mm = 0; mm < this.arrayMm.length; mm++) {
      if (!this.arrayMm[mm]) continue;

      this.dd = new Date(this.financial_year, mm + 1, 0).getDate();
      this.mm = mm;

      this.values = {
        flow: new Array(this.dd).fill(''),
        transactions: new Array(this.dd).fill('')
      };

      this.readTttTransactions_();
      this.readCalendarTransactions_();

      this.sheet.getRange(4, 2 + 4 * mm, this.dd, 1).setFormulas(Utils.transpose([this.values.flow]));
      this.sheet.getRange(4, 4 + 4 * mm, this.dd, 1).setValues(Utils.transpose([this.values.transactions]));
    }

    SpreadsheetApp.flush();
    this.arrayMm = new Array(12).fill(false);

    return this;
  }
}
