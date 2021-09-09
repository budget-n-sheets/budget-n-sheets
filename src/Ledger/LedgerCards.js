class LedgerCards extends Ledger {
  constructor () {
    super('Cards');
    this._category = 'cards';

    this._specs = Object.freeze({
      nullSearch: 4,
      row: 6,
      width: 5
    });
  }
}
