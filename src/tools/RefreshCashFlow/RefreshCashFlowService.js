/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class RefreshCashFlowService {
  static isCompatible (sheet) {
    const name = sheet.getName()
    return name === 'Cash Flow' ||
           Consts.month_name.short.indexOf(name) > -1
  }

  static serve (sheet, ranges) {
    if (!this.isCompatible(sheet)) {
      this.showWarning()
      return
    }

    if (!SpreadsheetApp2.getActive().getSheetByName('Cash Flow')) {
      this.showMissing()
      return
    }

    const indexes = RefreshCashFlow.filterRanges(ranges)
    RefreshCashFlow.refresh(indexes)
  }

  static showMissing () {
    SpreadsheetApp2.getUi().alert(
      "Can't refresh cash flow",
      'Sheet Cash Flow not found.',
      SpreadsheetApp2.getUi().ButtonSet.OK)
  }

  static showWarning () {
    SpreadsheetApp2.getUi().alert(
      "Can't refresh cash flow",
      'Select a month or Cash Flow to refresh the flow.',
      SpreadsheetApp2.getUi().ButtonSet.OK)
  }
}
