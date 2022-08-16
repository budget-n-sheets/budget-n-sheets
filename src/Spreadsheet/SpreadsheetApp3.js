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
