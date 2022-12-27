/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

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
