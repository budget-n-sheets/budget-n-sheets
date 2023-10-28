/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class InsertRowsService {
  static isCompatible (name) {
    return name === 'Tags' ||
           Consts.month_name.short.indexOf(name) > -1
  }

  static serve (sheet) {
    const name = sheet.getSheetName()
    if (!this.isCompatible(name)) {
      this.showWarning()
      return
    }

    InsertRows.insertRows(sheet)
  }

  static showWarning () {
    SpreadsheetApp2.getUi().alert(
      "Can't insert rows",
      'Select a month or Tags to insert rows.',
      SpreadsheetApp2.getUi().ButtonSet.OK)
  }
}
