class LedgerCards extends Ledger {
  constructor (sheet) {
    super(sheet);
    this._category = 'cards';
    this._insertRows = new ToolInsertRowsCards(sheet);

    this._specs = Object.freeze({
      col: {
        value: 3
      },
      row: 6,
      width: 6
    });
  }
}