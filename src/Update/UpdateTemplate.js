class UpdateTemplate extends Update {
  constructor () {
    const v0 = ClassVersion.getValueOf('template');
    const vA = Info.template.version;
    const list = [
      [
        null, [''], [''], [''], [''], [''], [''], [''], [''], [''],
        [''], [''], [''],
        ['v0m13p0_', 'v0m13p1_', 'v0m13p2_']
      ]
    ];

    super(v0, vA, list);

    this._key = 'template';
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
    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();

    const sheet = spreadsheet.getSheetByName('_Unique');
    if (!sheet) return 0;

    const num_acc = SettingsConst.getValueOf('number_accounts');
    const numCards = Spreadsheet2.getSheetByName('Cards').getMaxRows() - 5;

    let range_accounts = '';
    let range_cards = '';

    for (let i = 0; i < 12; i++) {
      range_cards += 'Cards!' + RangeUtils.rollA1Notation(6, 2 + 6 * i, numCards, 1) + '; ';

      const mm = Spreadsheet2.getSheetByName(Consts.month_name.short[i]);
      if (!mm) continue;
      const numRows = mm.getMaxRows() - 4;

      for (let k = 0; k <= num_acc; k++) {
        range_accounts += Consts.month_name.short[i] + '!' + RangeUtils.rollA1Notation(5, 2 + 5 * k, numRows, 1) + '; ';
      }
    }

    range_accounts = '{' + range_accounts.slice(0, -2) + '}';
    sheet.getRange(1, 1).setFormula('SORT(UNIQUE(TRIM(' + range_accounts + ')))');

    range_cards = '{' + range_cards.slice(0, -2) + '}';

    let formula = 'IFNA(FILTER(' + range_cards + '; NOT(REGEXMATCH(' + range_cards + '; "[0-9]+/[0-9]+"))); ); ';
    formula += 'REGEXREPLACE(IFNA(FILTER(' + range_cards + '; REGEXMATCH(' + range_cards + '; "[0-9]+/[0-9]+")); ); "[0-9]+/[0-9]+"; "")';
    formula = 'SORT(TRIM({' + formula + '})); ';
    formula += 'SORT(TRIM(IFNA(FILTER(' + range_cards + '; REGEXMATCH(' + range_cards + '; "[0-9]+/[0-9]+")); )))';
    formula = 'UNIQUE({' + formula + '})';

    sheet.getRange(1, 2).setFormula(formula);

    const tags = 'Tags!' + RangeUtils.rollA1Notation(2, 5, 40, 1);

    range_accounts = '';
    range_cards = '';

    for (let i = 0; i < 12; i++) {
      range_cards += 'Cards!' + RangeUtils.rollA1Notation(6, 5 + 6 * i, numCards, 1) + '; ';

      const mm = Spreadsheet2.getSheetByName(Consts.month_name.short[i]);
      if (!mm) continue;
      const numRows = mm.getMaxRows() - 4;

      for (let k = 0; k <= num_acc; k++) {
        range_accounts += Consts.month_name.short[i] + '!' + RangeUtils.rollA1Notation(5, 4 + 5 * k, numRows, 1) + '; ';
      }
    }

    range_accounts = '{' + range_accounts.slice(0, -2) + '}';
    range_cards = '{' + range_cards.slice(0, -2) + '}';

    formula = 'IFNA(FILTER(' + tags + '; REGEXMATCH(' + tags + '; "^\\S+$")); )';
    formula = 'SORT({TRIM(CONCAT("#"; ' + formula + ')); "#dp"; "#wd"; "#qcc"; "#ign"; "#rct"; "#trf"})';
    formula = 'SORT(TRIM(' + range_accounts + ')); ' + formula;
    sheet.getRange(1, 3).setFormula('UNIQUE({' + formula + '})');

    formula = 'IFNA(FILTER(' + tags + '; REGEXMATCH(' + tags + '; "^\\S+$")); )';
    formula = 'SORT({TRIM(CONCAT("#"; ' + formula + ')); "#wd"; "#ign"})';
    formula = 'SORT(TRIM(' + range_cards + ')); ' + formula;
    sheet.getRange(1, 4).setFormula('UNIQUE({' + formula + '})');

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

    askResetSuggestions();

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
