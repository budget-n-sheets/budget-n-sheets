class Spreadsheet3 {
  static getMetadata () {
    return SpreadsheetApp2.getActive().getMetadata();
  }

  static getSheetByName (name) {
    return SpreadsheetApp2.getActive().getSheetByName(name);
  }
}
