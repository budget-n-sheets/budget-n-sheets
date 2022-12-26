/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SpreadsheetService {
  static copySheetsFromSource (id, names) {
    const source = SpreadsheetApp.openById(id);
    const destination = SpreadsheetApp3.getActive();

    names.forEach(name => {
      source.getSheetByName(name)
        .copyTo(destination)
        .setName(name);
    });
  }

  static deleteAllSheets () {
    const spreadsheet = SpreadsheetApp3.getActive();
    const sheets = spreadsheet.getSheets();

    sheets[0].showSheet();
    spreadsheet.setActiveSheet(sheets[0]);

    spreadsheet.insertSheet();
    sheets.forEach(sheet => spreadsheet.deleteSheet(sheet));
  }

  static isSpreadsheetAvailable (spreadsheetId) {
    try {
      SpreadsheetApp.openById(spreadsheetId);
    } catch (err) {
      return false;
    }

    return true;
  }

  static removeAllMetadata () {
    SpreadsheetApp3.getActive()
      .createDeveloperMetadataFinder()
      .withVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
      .find()
      .forEach(m => m.remove());
  }
}
