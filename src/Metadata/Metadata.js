class Metadata {
  constructor (spreadsheet) {
    this.spreadsheet = spreadsheet || SpreadsheetApp2.getActiveSpreadsheet();
  }

  getValueOf (key) {
    const list = this.spreadsheet.createDeveloperMetadataFinder()
      .withVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
      .withKey(key)
      .find();

    return list.length > 0 ? JSON.parse(list[0].getValue()) : null;
  }

  hasKey (key) {
    return this.spreadsheet.createDeveloperMetadataFinder()
      .withVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
      .withKey(key)
      .find().length > 0;
  }

  update (key, value) {
    if (this.hasKey(key)) {
      this.spreadsheet.createDeveloperMetadataFinder()
        .withVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
        .withKey(key)
        .find()[0]
        .setValue(JSON.stringify(value))
        .moveToSpreadsheet();
    } else {
      this.spreadsheet.addDeveloperMetadata(
        key, JSON.stringify(value),
        SpreadsheetApp.DeveloperMetadataVisibility.PROJECT);
    }

    return this;
  }
}
