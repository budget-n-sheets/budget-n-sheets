class SpreadsheetService {
  static copySheetsFromSource (id, names) {
    const source = SpreadsheetApp.openById(id);
    const destination = SpreadsheetApp2.getActive();

    names.forEach(name => {
      source.getSheetByName(name)
        .copyTo(destination)
        .setName(name);
    });
  }

  static deleteAllSheets () {
    const spreadsheet = SpreadsheetApp2.getActive();
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
    SpreadsheetApp2.getActive()
      .createDeveloperMetadataFinder()
      .withVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
      .find()
      .forEach(m => m.remove());
  }
}
