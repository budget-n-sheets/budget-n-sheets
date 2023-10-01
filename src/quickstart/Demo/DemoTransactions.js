/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class DemoTransactions extends QuickstartDemo {
  constructor () {
    super(['mm']);
  }

  makeConfig (num) {
    this._accsService = new AccountsService()
    const code = this._accsService.getAny().metadata.name

    switch (num) {
      case 1:
        this.data = [[code, 7, 'Deposit (to my account #dp)', Noise.randomValue(3, 2), '#dp', false]];
        break;
      case 2:
        this.data = [[code, 7, 'Transfer (from someone #trf)', Noise.randomValue(3, 2), '#trf', false]];
        break;
      case 3:
        this.data = [[code, 7, 'Transfer (to someone #trf)', Noise.randomValueNegative(3, 2), '#trf', false]];
        break;
      case 4:
        this.data = [[code, 7, 'Withdrawal (cash dispenser #wd)', Noise.randomValueNegative(3, 2), '#wd', false]];
        break;

      default:
        return;
    }

    this.getSheets_();

    this.isReady = true;
    return this;
  }

  play () {
    new LedgerTtt(this.mm).appendTransactions(this.data).fillInWithZeros().activate();
  }
}
