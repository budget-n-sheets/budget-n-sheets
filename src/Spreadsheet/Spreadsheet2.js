class Spreadsheet2 {
  static getMetadata () {
    return RapidAccess.spreadsheet().metadata();
  }

  static getSheetByName (name) {
    const sheets = RapidAccess.spreadsheet().sheets();
    return sheets[name] ||
          (sheets[name] = SpreadsheetApp2.getActive().getSheetByName(name));
  }
}
