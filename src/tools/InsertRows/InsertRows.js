/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class InsertRows {
  static getSheetSpecs_ (sheet) {
    const name = sheet.getSheetName()
    if (name === 'Tags') return SheetTags.specs
    else if (Consts.month_name.short.indexOf(name) > -1) return SheetMonth.specs
    else throw new Error('Specifications not found.')
  }

  static insertNumRows_ (sheet, specs, numRows = 400) {
    let maxRows = sheet.getMaxRows()
    if (maxRows < specs.row) throw new Error('Bad sheet structure.')

    sheet.insertRowsBefore(maxRows, numRows)
    maxRows += numRows

    if (sheet.getLastRow() === maxRows) {
      const maxCols = sheet.getMaxColumns()
      const range = sheet.getRange(maxRows, 1, 1, maxCols)
      const values = range.getValues()

      range.clearContent()
        .offset(0 - numRows, 0)
        .setValues(values)
    }

    SpreadsheetApp.flush()
  }

  static insertRows (sheet) {
    const specs = this.getSheetSpecs_(sheet)

    this.insertNumRows_(sheet, specs)
  }

  static insertRowsTo (sheet, height, extras = false) {
    const specs = this.getSheetSpecs_(sheet)
    const maxRows = sheet.getMaxRows() - specs.row + 1
    if (maxRows >= height) return
    if (maxRows < 1) throw new Error('Bad sheet structure.')

    this.insertNumRows_(sheet, specs, height - maxRows + (!!extras * 100))
  }
}
