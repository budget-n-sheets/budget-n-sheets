class UpdateTemplate extends Update {
  constructor () {
    const v0 = ClassVersion.getValueOf('template');
    const vA = Info.template.version;
    const list = [
      [
        null, [''], [''], [''], [''], [''], [''], [''], [''], [''],
        [''], [''], [''],
        ['v0m13p0_', 'v0m13p1_']
      ]
    ];

    super(v0, vA, list);

    this._key = 'template';
  }

  /**
   * Fix month name.
   *
   * 0.13.1
   */
  v0m13p1_ () {
    const sheet = Spreadsheet2.getSheetByName('Summary');
    if (!sheet) return 0;

    sheet.getRange('B20').setValue('October');
    return 0;
  }

  /**
   * Update tags data validation rule.
   *
   * 0.13.0
   */
  v0m13p0_ () {
    const sheet = Spreadsheet2.getSheetByName('Tags');
    if (!sheet) return 0;

    const numRows = sheet.getMaxRows() - 1;
    if (numRows < 1) return 0;

    sheet.getRange(2, 5, numRows, 1).clearDataValidations();

    const rule = SpreadsheetApp.newDataValidation()
      .requireFormulaSatisfied('=REGEXMATCH($E2; "^\\S+$")')
      .setHelpText('Whitespace is not allowed')
      .setAllowInvalid(true)
      .build();

    sheet.getRange(2, 5, numRows, 1).setDataValidation(rule);
    return 0;
  }
}
