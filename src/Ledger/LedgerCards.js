class LedgerCards extends Ledger {
  constructor (sheet) {
    super(sheet);
    this._category = 'cards';

    this._specs = Object.freeze({
      nullSearch: 4,
      row: 6,
      width: 6
    });
  }
}
