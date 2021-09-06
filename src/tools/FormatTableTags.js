class FormatTableTags {
  constructor (sheet) {
    this.sheet = sheet || SpreadsheetApp2.getActive().getSheetByName('Tags');

    this.sortSpec = [
      { column: 2, ascending: true },
      { column: 1, ascending: true }
    ];
    this.rule = SpreadsheetApp.newDataValidation()
      .requireCheckbox()
      .setAllowInvalid(false)
      .build();
  }

  formatTable () {
    if (!this.sheet) return;

    const numRows = this.sheet.getMaxRows() - 1;
    if (numRows < 1) return;

    this.sheet.getRange(2, 1, numRows, 5)
      .trimWhitespace()
      .sort(this.sortSpec);

    const values = this.sheet.getRange(2, 4, this.sheet.getLastRow() - 1, 1)
      .getValues()
      .forEach((b, i, a) => {
        a[i][0] = (b[0] === true);
      });

    this.sheet.getRange(2, 4, numRows, 1)
      .clearDataValidations()
      .removeCheckboxes()
      .clearContent();

    const num = this.sheet.getLastRow() - 1;
    if (num < 1) return;

    this.sheet.getRange(2, 4, numRows, 1)
      .insertCheckboxes()
      .setDataValidation(this.rule)
      .offset(0, 0, num, 1)
      .setValues(values.slice(0, num));
  }
}
