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

    const range = this.sheet.getRange(2, 4, numRows, 1);

    range.offset(0, -3, numRows, 5).sort(this.sortSpec);

    const values = range.offset(0, 0, this.sheet.getLastRow() - 1)
      .getValues()
      .forEach((b, i, a) => {
        a[i] = [(b[0] === true)];
      });

    range.clearDataValidations()
      .removeCheckboxes()
      .clearContent();

    const num = this.sheet.getLastRow() - 1;
    if (num < 1) return;

    range.insertCheckboxes()
      .setDataValidation(this.rule)
      .offset(0, 0, num, 1)
      .setValues(values.slice(0, num));
  }
}
