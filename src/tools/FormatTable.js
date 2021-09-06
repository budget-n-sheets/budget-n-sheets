class FormatTable {
  static pick (sheet) {
    const name = sheet.getName();
    switch (name) {
      case 'Tags':
        return new FormatTableTags(sheet);

      default:
        return 1;
    }
  }

  static showWarning () {
    SpreadsheetApp2.getUi().alert(
      "Can't format table",
      'Select a month, Cards or Tags to format the table.',
      SpreadsheetApp2.getUi().ButtonSet.OK);
  }
}
