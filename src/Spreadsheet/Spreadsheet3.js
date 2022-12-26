/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class Spreadsheet3 {
  static getMetadata () {
    return SpreadsheetApp2.getActive().getMetadata();
  }

  static getSheetByName (name) {
    return SpreadsheetApp2.getActive().getSheetByName(name);
  }
}
