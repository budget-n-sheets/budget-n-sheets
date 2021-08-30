class LedgerTags extends Ledger {
  constructor (sheet) {
    super(sheet);
    this._category = 'tags';

    this._specs = Object.freeze({
      nullSearch: 5,
      row: 2,
      width: 5
    });
  }
}
