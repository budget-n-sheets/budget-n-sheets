/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class LedgerTtt extends Ledger {
  constructor (mm) {
    const name = (typeof mm === 'number' ? Consts.month_name.short[mm] : mm)
    super(name)
    this._category = 'ttt'

    this._specs = Object.freeze(SheetMonth.specs)
  }
}
