/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class DemoCashFlow {
  static play1 () {
    const indexes = new Array(12).fill(false)
    const mm = LocaleUtils.getDate().getMonth()

    indexes[mm] = true
    RefreshCashFlow.refresh(indexes)

    SpreadsheetApp.flush()
    SpreadsheetApp2.getActive()
      .getSheetByName('Cash Flow')
      .getRange('B2:D2')
      .offset(0, 4 * mm)
      .activate()
  }
}
