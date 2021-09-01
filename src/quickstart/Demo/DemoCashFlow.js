class DemoCashFlow extends QuickstartDemo {
  constructor () {
    super(['mm', 'Cash Flow']);
  }

  demo_ () {
    const month = Consts.month_name.short[this.mm];
    const num_acc = 1 + SettingsConst.getValueOf('number_accounts');

    const ledger = new LedgerAccounts(this.sheets[month]);

    for (let k = 1; k < num_acc; k++) {
      ledger.fillInWithZeros(k);
    }

    updateCashFlow_(this.mm);

    this.sheets['Cash Flow'].getRange(1, 2 + 4 * this.mm, 1, 3).activate();
  }

  makeConfig (num) {
    this.getSheets_();

    this.isReady = true;
    return this;
  }

  play () {
    this.demo_();
  }
}
