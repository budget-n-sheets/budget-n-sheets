class SpreadsheetService {
  static copySheetsFromSource (sourceId, sheetNames) {
    const source = SpreadsheetApp.openById(sourceId);
    const destination = SpreadsheetApp2.getActiveSpreadsheet();
    const sheets = destination.getSheets();

    sheetNames.forEach(name => {
      source.getSheetByName(name)
        .copyTo(destination)
        .setName(name);
    });

    sheets.forEach(sheet => destination.deleteSheet(sheet));
  }

  static deleteAllSheets () {
    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
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
    SpreadsheetApp2.getActiveSpreadsheet()
      .createDeveloperMetadataFinder()
      .withVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
      .find()
      .forEach(m => m.remove());
  }
}
