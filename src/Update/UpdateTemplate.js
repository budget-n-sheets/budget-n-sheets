class UpdateTemplate extends Update {
  constructor () {
    const v0 = ClassVersion.getValueOf('template');
    const vA = Info.template.version;
    const list = [
      [
        null, [''], [''], [''], [''], [''], [''], [''], [''], [''],
        [''], [''], [''],
        ['v0m13p0_', 'v0m13p1_', 'v0m13p2_', 'v0m13p3_', '', 'v0m13p5_'],
        ['v0m14p0_']
      ]
    ];

    super(v0, vA, list);

    this._key = 'template';
  }

  /**
   * Update sheet 'Summary'.
   * Refresh sheet 'Tags'.
   *
   * 0.14.0
   */
   v0m14p0_ () {
    new MakeSheetSummary().reinstall();
    new MakeSheetTags().makeConfig().make();
    return 0;
  }

  /**
   * Fix tags data validation rule.
   *
   * 0.13.5
   */
   v0m13p5_ () {
    const sheet = Spreadsheet2.getSheetByName('Tags');
    if (!sheet) return 0;

    const numRows = sheet.getMaxRows() - 1;
    if (numRows < 1) return 0;

    sheet.getRange(2, 5, numRows, 1).clearDataValidations();

    const rule = SpreadsheetApp.newDataValidation()
      .requireFormulaSatisfied('=REGEXMATCH($E2; "^\\w+$")')
      .setHelpText('Charset: 0-9, a-z, A-Z, _')
      .setAllowInvalid(true)
      .build();

    sheet.getRange(2, 5, numRows, 1).setDataValidation(rule);
    return 0;
  }

  /**
   * Fix data valiation ranges.
   *
   * 0.13.3
   */
  v0m13p3_ () {
    askResetSuggestions();
    return 0;
  }

  v0m13p2s0_ () {
    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();

    let sheet = spreadsheet.getSheetByName('_About BnS');
    if (sheet) spreadsheet.deleteSheet(sheet);

    sheet = SpreadsheetApp.openById(Info.template.id)
      .getSheetByName('_About BnS')
      .copyTo(spreadsheet)
      .setName('_About BnS')
      .setTabColor('#6aa84f');

    spreadsheet.setActiveSheet(sheet);
    spreadsheet.moveActiveSheet(spreadsheet.getNumSheets());

    sheet.protect().setWarningOnly(true);
    sheet.hideSheet();

    return 0;
  }

  v0m13p2s1_ () {
    const sheet = Spreadsheet2.getSheetByName('_Unique');
    if (!sheet) return 0;

    sheet.getRange(1, 1).setFormula(SheetUniqueFormulas.getTttTransaction_());
    sheet.getRange(1, 2).setFormula(SheetUniqueFormulas.getCardsTransaction_());
    sheet.getRange(1, 3).setFormula(SheetUniqueFormulas.getTttTags_());
    sheet.getRange(1, 4).setFormula(SheetUniqueFormulas.getCardsTags_());

    return 0;
  }

  /**
   * Update About page.
   * Update Unique formulas.
   *
   * 0.13.2
   */
  v0m13p2_ () {
    let r = 0;

    r = this.v0m13p2s0_();
    if (r !== 0) return r;

    r = this.v0m13p2s1_();
    if (r !== 0) return r;

    return 0;
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
