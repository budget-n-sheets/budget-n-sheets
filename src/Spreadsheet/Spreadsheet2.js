class Spreadsheet2 {
  static getSheetByName (name) {
    const sheets = RapidAccess.spreadsheet().sheets();
    return sheets[name] ||
          (sheets[name] = SpreadsheetApp2.getActive().getSheetByName(name));
  }
}
