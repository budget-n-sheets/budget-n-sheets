class SpreadsheetService {
  static copySheetsFromSource () {
    const source = SpreadsheetApp.openById(APPS_SCRIPT_GLOBAL.template_id);
    const destination = SpreadsheetApp2.getActiveSpreadsheet();
    const sheets = destination.getSheets();

    const list = APPS_SCRIPT_GLOBAL.template_sheets;
    list.forEach(name => {
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

    sheets.forEach(sheet => spreadsheet.deleteSheet(sheet));

    spreadsheet.insertSheet();
    spreadsheet.deleteSheet(sheets[0]);
  }

  static removeAllMetadata () {
    SpreadsheetApp2.getActiveSpreadsheet()
      .createDeveloperMetadataFinder()
      .withVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
      .find()
      .forEach(m => m.remove());
  }
}
