class DemoTransactions extends QuickstartDemo {
  constructor () {
    super(['mm']);
  }

  makeConfig (num) {
    switch (num) {
      case 1:
        this.data = [[7, 'Deposit (to my account #dp)', Noise.randomValue(3, 2), '#dp']];
        break;
      case 2:
        this.data = [[7, 'Transfer (from someone #trf)', Noise.randomValue(3, 2), '#trf']];
        break;
      case 3:
        this.data = [[7, 'Transfer (to someone #trf)', Noise.randomValueNegative(3, 2), '#trf']];
        break;
      case 4:
        this.data = [[7, 'Withdrawal (cash dispenser #wd)', Noise.randomValueNegative(3, 2), '#wd']];
        break;

      default:
        return;
    }

    this.getSheets_();

    this.isReady = true;
    return this;
  }

  play () {
    new LedgerAccounts(this.sheet).appendTransactions(1, this.data).fillInWithZeros(1).activate();
  }
}
