/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class FormatTable {
  constructor () {
    this.rangeList = { indexes: [], ranges: [] };
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

  get indexes () {
    return this.rangeList.indexes;
  }

  set indexes (indexes) {
    this.rangeList.indexes = this.rangeList.indexes.concat(indexes);
  }

  get ranges () {
    return this.rangeList.ranges;
  }

  set ranges (ranges) {
    this.rangeList.ranges = this.rangeList.ranges.concat(ranges);
  }
}
