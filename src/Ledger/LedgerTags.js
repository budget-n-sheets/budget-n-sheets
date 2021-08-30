class LedgerTags extends Ledger {
  constructor (sheet) {
    super(sheet);
    this._category = 'tags';

    this._specs = Object.freeze({
      row: 2,
      width: 5
    });
  }
}
