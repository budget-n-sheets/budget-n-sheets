class LedgerAccounts extends Ledger {
  constructor (sheet) {
    super(sheet);
    this._category = 'accounts';

    this._specs = Object.freeze({
      col: {
        value: 2
      },
      row: 5,
      width: 5
    });
  }
}
