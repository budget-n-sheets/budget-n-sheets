/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class FormatTableService {
  static formatTags_ (ranges) {
    const specs = SheetTags.specs
    const filtered = FormatTable.filterRanges(ranges, specs)
    FormatTableTags.format(filtered)
  }

  static formatMonth_ (sheet, ranges) {
    const specs = SheetMonth.specs
    const filtered = FormatTable.filterRanges(ranges, specs)
    FormatTableMonth.format(sheet, filtered)
  }

  static isCompatible (name) {
    return name === 'Tags' ||
           Consts.month_name.short.indexOf(name) > -1
  }

  static serve (sheet, ranges) {
    const name = sheet.getSheetName()
    if (!this.isCompatible(name)) {
      this.showWarning()
      return
    }

    if (name === 'Tags') this.formatTags_(ranges)
    else this.formatMonth_(sheet, ranges)
  }

  static showWarning () {
    SpreadsheetApp2.getUi().alert(
      "Can't format table",
      'Select a month or Tags to format the table.',
      SpreadsheetApp2.getUi().ButtonSet.OK)
  }
}
