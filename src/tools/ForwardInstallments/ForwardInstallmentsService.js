/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class ForwardInstallmentsService {
  static isCompatible (name) {
    return Consts.month_name.short.indexOf(name) > -1
  }

  static serve (sheet, ranges) {
    const name = sheet.getSheetName()
    if (!this.isCompatible(name)) {
      this.showWarning()
      return
    }

    const mm = Consts.month_name.short.indexOf(name)
    const filtered = ForwardInstallments.filterRanges(ranges)

    if (filtered.length > 0) ForwardInstallments.forwardRanges(mm, filtered)
    else ForwardInstallments.forwardIndex(mm)
  }

  static showWarning () {
    SpreadsheetApp2.getUi().alert(
      "Can't forward installment",
      'Select a month to forward installments.',
      SpreadsheetApp2.getUi().ButtonSet.OK)
  }
}
