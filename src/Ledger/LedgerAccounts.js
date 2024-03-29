/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

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
