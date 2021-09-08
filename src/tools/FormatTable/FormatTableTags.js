class FormatTableTags extends FormatTable {
  constructor (sheet) {
    super();
    this.sheet = sheet || SpreadsheetApp2.getActive().getSheetByName('Tags');
    this.numRows = 0;

    this._specs = Object.freeze({
      nullSearch: 5,
      row: 2,
      width: 5
    });

    this.sortSpec = [
      { column: 2, ascending: true },
      { column: 1, ascending: true }
    ];
    this.rule = SpreadsheetApp.newDataValidation()
      .requireCheckbox()
      .setAllowInvalid(false)
      .build();
  }

  formatRange_ (range) {
    range.trimWhitespace().sort(this.sortSpec);

    const values = range.offset(0, 3, this.numRows, 1).getValues();

    values.forEach((b, i, a) => {
      a[i][0] = (b[0] === true);
    });

    range.offset(0, 3, this.numRows, 1)
      .clearDataValidations()
      .removeCheckboxes()
      .clearContent()
      .insertCheckboxes()
      .setDataValidation(this.rule)
      .setValues(values);
  }

  formatTable_ () {
    this.sheet.getRange(2, 1, this.numRows, 5)
      .trimWhitespace()
      .sort(this.sortSpec);

    const values = this.sheet.getRange(2, 4, this.sheet.getLastRow() - 1, 1).getValues();

    values.forEach((b, i, a) => {
      a[i][0] = (b[0] === true);
    });

    this.sheet.getRange(2, 4, this.numRows, 1)
      .clearDataValidations()
      .removeCheckboxes()
      .clearContent();

    const num = this.sheet.getLastRow() - 1;
    if (num < 1) return;

    this.sheet.getRange(2, 4, this.numRows, 1)
      .insertCheckboxes()
      .setDataValidation(this.rule)
      .offset(0, 0, num, 1)
      .setValues(values.slice(0, num));
  }

  format () {
    if (!this.sheet) return;

    this.numRows = this.sheet.getMaxRows() - 1;

    if (this.numRows < 1) {
      return;
    } else if (this.rangeList.index.length > 0) {
      this.formatTable_();
      return;
    }

    this.rangeList.range.forEach(range => {
      this.numRows = range.getNumRows();
      this.formatRange_(range);
    });
  }
}
