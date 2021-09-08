class SpreadsheetApp2 {
  static getActive () {
    const self = RapidAccess.spreadsheet()._self;
    return self.getActive || (self.getActive = SpreadsheetApp.getActive());
  }

  static getActiveSpreadsheet () {
    const self = RapidAccess.spreadsheet()._self;
    return self.getActiveSpreadsheet || (self.getActiveSpreadsheet = SpreadsheetApp.getActiveSpreadsheet());
  }

  static getUi () {
    const self = RapidAccess.spreadsheet()._self;
    return self.getUi || (self.getUi = SpreadsheetApp.getUi());
  }
}
