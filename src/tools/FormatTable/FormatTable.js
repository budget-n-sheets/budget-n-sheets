class FormatTable {
  constructor () {
    this.rangeList = { index: [], range: [] };
  }

  static pick (sheet) {
    const name = sheet.getName();
    switch (name) {
      case 'Cards':
        return new FormatTableCards();
      case 'Tags':
        return new FormatTableTags();

      default:
        break;
    }

    const mm = Consts.month_name.short.indexOf(name);
    if (mm === -1) return 1;
    return new FormatTableAccounts(mm);
  }

  static showWarning () {
    SpreadsheetApp2.getUi().alert(
      "Can't format table",
      'Select a month, Cards or Tags to format the table.',
      SpreadsheetApp2.getUi().ButtonSet.OK);
  }

  set indexes (indexes) {
    this.rangeList.indexes = this.rangeList.indexes.concat(indexes);
  }

  set ranges (ranges) {
    this.rangeList.ranges = this.rangeList.ranges.concat(ranges);
  }
}
