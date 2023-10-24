/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SuspendRecalculation extends SheetBackstageRecalculation {
  suspend (start, end = 12) {
    if (start >= end) return

    const columns = this._sheet.getLastColumn() - 1
    if (columns < 1) return

    const range = this.getGroupRange(start, 0, end - start)
    range.setValues(range.getValues())

    for (let i = start; i < end; i++) {
      this.load[i] = true
    }
    SettingsSpreadsheet.set('optimize_load', this.load)

    SpreadsheetApp.flush()
    return this
  }
}
