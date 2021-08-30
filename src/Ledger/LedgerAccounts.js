class LedgerAccounts extends Ledger {
  constructor (sheet) {
    super(sheet);
    this._category = 'accounts';

    this._specs = Object.freeze({
      nullSearch: 3,
      row: 5,
      width: 4
    });
  }
}
