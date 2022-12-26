/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SpreadsheetApp3 {
  static getActive () {
    return SpreadsheetApp2.getActive().spreadsheet;
  }

  static getActiveSpreadsheet () {
    const self = RapidAccess.spreadsheet().self;
    return self.getActiveSpreadsheet || (self.getActiveSpreadsheet = SpreadsheetApp.getActiveSpreadsheet());
  }

  static getUi () {
    const self = RapidAccess.spreadsheet().self;
    return self.getUi || (self.getUi = SpreadsheetApp.getUi());
  }
}
