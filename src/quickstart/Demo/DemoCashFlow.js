class DemoCashFlow extends QuickstartDemo {
  constructor () {
    super(['mm', 'Cash Flow']);
  }

  demo_ () {
    const num_acc = 1 + SettingsConst.get('number_accounts');

    const ledger = new LedgerAccounts(this.mm);

    for (let k = 1; k < num_acc; k++) {
      ledger.fillInWithZeros(k);
    }

    const indexes = new Array(12).fill(false);
    indexes[this.mm] = true;

    const tool = new RefreshCashFlow();
    tool.indexes = indexes;
    tool.refresh();

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
