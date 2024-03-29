/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class DemoAccCards extends QuickstartDemo {
  makeConfig (num) {
    if (num === 1) this._accId = new AccountsService().getAny().id;
    if (num < 3) {
      this.isReady = true;
      return;
    }

    this._cardsService = new CardsService();
    if (!this._cardsService.hasCards()) {
      this.isReady = true;
      return;
    }

    const code = this._cardsService.getAny().metadata.code;
    let mm = 1;

    if (num === 3) {
      if (SettingsConst.get('financial_year') === Consts.date.getFullYear()) {
        mm = Consts.date.getMonth();
        if (mm === 0) mm = 1;
        else if (mm === 11) mm = 10;
      }

      this.required = ['Cards'];

      this.list = [];
      for (let i = 0; i < mm - 1; i++) {
        this.list.push([]);
      }

      const val = Noise.randomValueNegative(2, 2);

      this.list.push([
        [7, 'Online shopping 1/3 (with instalments in d/d format)', code, val, '']
      ]);

      this.list.push([
        [-7, 'Online shopping 2/3 (with instalments in d/d format)', code, val, ''],
        [3, 'Grocery shop', code, -10, ''],
        [5, 'Gas station', code, Noise.randomValueNegative(3, 2), ''],
        [5, 'Grocery shop refund', code, 10, '']
      ]);

      this.list.push([
        [-7, 'Online shopping 3/3 (with instalments in d/d format)', code, val, '']
      ]);
    } else if (num === 4) {
      this.required = ['mm'];

      this.list = [
        [],
        [[7, code + ' bill payment', Noise.randomValueNegative(3, 2), '#qcc']]
      ];
    } else {
      return;
    }

    this.getSheets_();

    switch (num) {
      case 3:
        this._ledger = new LedgerCards();
        break;
      case 4:
        this._ledger = new LedgerAccounts(this.mm);
        break;
    }

    this.isReady = true;
    return this;
  }

  play (num) {
    switch (num) {
      case 1:
        showDialogEditAccount(this._accId);
        return;
      case 2:
        showDialogAddCard();
        return;
    }

    if (!this._cardsService.hasCards()) {
      showDialogAddCard();
      return;
    }

    const rangeList = [];

    this.list.forEach((values, index) => {
      if (values.length === 0) return;

      this._ledger.appendTransactions(index, values);
      if (num === 2) this._ledger.fillInWithZeros(index);

      rangeList.push(this._ledger.lastRange.getA1Notation());
    });

    this.sheet.getRangeList(rangeList).activate();
  }
}
