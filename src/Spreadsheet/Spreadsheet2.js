class Spreadsheet2 {
  static getMetadata () {
    return RapidAccess.spreadsheet().metadata();
  }

  static getSheetByName (name) {
    const sheets = RapidAccess.spreadsheet().sheets();
    if (!sheets[name]) return sheets[name] = SpreadsheetApp3.getActive().getSheetByName(name);
    try {
      sheets[name].getType();
    } catch (err) {
      sheets[name] = SpreadsheetApp3.getActive().getSheetByName(name);
    } finally {
      return sheets[name];
    }
  }
}
