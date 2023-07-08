/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class FormatTableTags extends FormatTable {
  constructor () {
    super();
    this.sheet = SpreadsheetApp2.getActive().getSheetByName('Tags');

    this.specs = Object.freeze({
      nullSearch: 5,
      row: 2,
      width: 5
    });

    this.sortSpec = {
      blank: [
        { column: 1, ascending: true },
        { column: 2, ascending: true },
        { column: 3, ascending: true },
        { column: 4, ascending: false },
        { column: 5, ascending: true }
      ],
      fancy: [
        { column: 2, ascending: true },
        { column: 1, ascending: true }
      ]
    };

    this.rule = SpreadsheetApp.newDataValidation()
      .requireCheckbox()
      .setAllowInvalid(false)
      .build();
  }

  formatRange_ (range) {
    const last = range.trimWhitespace()
      .sort(this.sortSpec.blank)
      .sort(5)
      .getValues()
      .findIndex(line => line[4] === '');
    if (last === 0) return;

    const numRows = (last === -1 ? range.getNumRows() : last);
    const analytics = range.offset(0, 0, numRows, 5)
      .sort(this.sortSpec.fancy)
      .offset(0, 3, range.getNumRows(), 1);

    const values = analytics.getValues();
    values.forEach((b, i, a) => {
      a[i][0] = (b[0] === true);
    });

    analytics.clearDataValidations()
      .removeCheckboxes()
      .clearContent()
      .insertCheckboxes()
      .setDataValidation(this.rule)
      .setValues(values);
  }

  format () {
    if (!this.sheet) return;

    if (this.rangeList.indexes.length === 0) {
      for (const range in this.rangeList.ranges) {
        if (range.getNumRows() > 1) this.formatRange_(range);
      }
      return;
    }

    const maxRows = this.sheet.getMaxRows() - 1;
    if (maxRows < 1) return;

    const range = this.sheet.getRange(2, 1, maxRows, 5);
    this.formatRange_(range);

    this.rangeList = { indexes: [], ranges: [] };
    return this;
  }
}
