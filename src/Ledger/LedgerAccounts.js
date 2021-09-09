class LedgerAccounts extends Ledger {
  constructor (mm) {
    const name = (typeof mm === 'number' ? Consts.month_name.short[mm] : mm);
    super(name);
    this._category = 'accounts';

    this._specs = Object.freeze({
      nullSearch: 3,
      row: 5,
      width: 4
    });
  }
}
