/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class UpdateTemplate extends Update {
  constructor () {
    const v0 = ClassVersion.get('template');
    const vA = Info.template.version;
    const list = [
      [
        null, [], [], [], [], [], [], [], [], [],
        [], [], [], [],
        ['', '', 'v0m14p2_'],
        ['v0m15p0_', '']
      ]
    ];

    super(v0, vA, list);
    this._key = 'template';
  }

  v0m15p0s5_ (sheets) {
    const spreadsheet = SpreadsheetApp2.getActive()

    for (let mm = 0; mm < 12; mm++) {
      const name = Consts.month_name.short[mm]
      let sheet

      sheet = spreadsheet.getSheetByFinder(name)
      if (sheet) continue

      new SheetMonth(mm).resetNumberFormat()
        .resetFormulas()
        .resetProtection()
        .resetFilter()
        .resetConditionalFormat()
        .resetSelectors()

      Spreadsheet2.stampSheetWithFinder(sheets.new[name])
    }

    new SheetTags().resetFormulas()
    treatLayout_(Consts.date.getFullYear(), Consts.date.getMonth())
    RecalculationService.resume(0, 12)

    const unique = SpreadsheetApp2.getActive().getSheetByName('_Unique')
    if (unique) {
      unique.getRange(1, 1).setFormula(SheetUniqueFormulas.getTttTransaction_())
      unique.getRange(1, 2).setFormula(SheetUniqueFormulas.getTttTags_())
    }

    return 0
  }

  v0m15p0s4_ (sheets, data) {
    const spreadsheet = SpreadsheetApp2.getActive()
    let sheet

    new SheetBackstage().getGroupRange(0, 0).setValue('')

    sheet = spreadsheet.getSheetByName('Tags')
    if (sheet) sheet.getRange('F1:Q1').setValue('')

    sheet = spreadsheet.getSheetByName('_Unique')
    if (sheet) sheet.getRange('A1:D1').setValue('')

    spreadsheet.getSheetByName('Cards')?.hideSheet()
    SpreadsheetApp.flush()

    if (sheets.new['Dec'].getName() === 'Dec') return 0

    for (let mm = 0; mm < 12; mm++) {
      const name = Consts.month_name.short[mm]

      if (sheets.bkp[mm]) {
        const bkp = sheets.new[name].getName().replace(/^new_/, 'bkp_')
        sheets.bkp[mm].setName(bkp).hideSheet()
      }

      if (sheets.new[name].getName() !== name) {
        sheets.new[name].setName(name)
        if (data[mm].length > 0) new LedgerTtt(mm).mergeTransactions(data[mm])
      }

      sheets.new[name].showSheet()
    }

    return 0
  }

  v0m15p0s3_ (data) {
    const sheet = SpreadsheetApp2.getActive().getSheetByName('Cards')
    if (!sheet) return 0

    const numRows = sheet.getMaxRows() - 5
    if (numRows < 1) return 0

    const maxCols = sheet.getMaxColumns()
    if (maxCols < 5) return 0

    let ks = 1 + (maxCols - maxCols % 6) / 6
    if (ks > 12) ks = 12

    const snapshot = Utils.sliceBlankRows(sheet.getRange(6, 1, numRows, 6 * ks).getValues())

    for (let mm = 0; mm < ks; mm++) {
      let table = snapshot.map(row => row.slice(0 + 6 * mm, 5 + 6 * mm))
      table = Utils.sliceBlankRows(table)

      for (let i = 0; i < table.length; i++) {
        const code = table[i].splice(2, 1)[0]
        table[i] = [code, ...table[i], /#ign/.test(table[i][3])]
      }

      if (table.length > 0) data[mm] = data[mm].concat(table)
    }

    return 0
  }

  v0m15p0s2_ (sheets, data) {
    const spreadsheet = SpreadsheetApp2.getActive()
    const numAccs = SettingsConst.get('number_accounts')

    const accounts = new AccountsService().list()
    const accs = ['Wallet', '', '', '', '', '']
    for (const acc of accounts) {
      accs[1 + acc.index] = acc.name
    }

    for (let mm = 0; mm < 12; mm++) {
      data[mm] = []

      const name = Consts.month_name.short[mm]
      let sheet

      sheet = spreadsheet.getSheetByFinder(`bkp_${name}`)

      if (!sheet) {
        sheet = spreadsheet.getSheetByName(name)
        if (!sheet) continue
        Spreadsheet2.stampSheetWithFinder(sheet, `bkp_${name}`)
      }

      sheets.bkp[mm] = sheet

      const numRows = sheet.getMaxRows() - 4
      if (numRows < 1) continue

      const maxCols = sheet.getMaxColumns()
      if (maxCols < 4) continue

      let ks = 1 + (maxCols - maxCols % 5) / 5
      if (ks > 6) ks = 6
      if (ks > 1 + numAccs) ks = 1 + numAccs

      const snapshot = Utils.sliceBlankRows(sheet.getRange(5, 1, numRows, 5 * ks).getValues())
      if (snapshot.length === 0) continue

      for (let k = 0; k < ks; k++) {
        let table

        table = snapshot.map(row => row.slice(0 + 5 * k, 4 + 5 * k))
        table = Utils.sliceBlankRows(table)
        for (let i = 0; i < table.length; i++) {
          table[i] = [accs[k], ...table[i], /#ign/.test(table[i][3])]
        }

        if (table.length > 0) data[mm] = data[mm].concat(table)
      }
    }

    return 0
  }

  v0m15p0s1_ (sheets) {
    const spreadsheet = SpreadsheetApp2.getActive()
    let sheetTTT, sheet

    sheet = spreadsheet.getSheetByFinder('new_Dec')
    if (sheet) {
      sheets.new['Dec'] = sheet
      for (let mm = 0; mm < 11; mm++) {
        const name = Consts.month_name.short[mm]
        sheet = spreadsheet.getSheetByFinder(`new_${name}`)
        if (sheet) sheets.new[name] = sheet
      }
      return 0
    }

    sheetTTT = spreadsheet.getSheetByFinder('TTT')
    if (!sheetTTT) return 2

    for (let mm = 0; mm < 12; mm++) {
      const name = Consts.month_name.short[mm]

      sheet = spreadsheet.getSheetByFinder(`new_${name}`)
      if (sheet) {
        sheets.new[name] = sheet
        continue
      }

      sheets.new[name] = spreadsheet.spreadsheet.insertSheet(
          `new_${Noise.randomString(5, 'lonum')}`,
          1 + mm,{ template: sheetTTT })
        .hideSheet()

      Spreadsheet2.stampSheetWithFinder(sheets.new[name], `new_${name}`)
      SpreadsheetApp.flush()
    }

    spreadsheet.spreadsheet.deleteSheet(sheetTTT)
    return 0
  }

  v0m15p0s0_ () {
    const spreadsheet = SpreadsheetApp2.getActive()
    let sheet

    sheet = spreadsheet.getSheetByFinder('TTT')
    if (sheet) return 0

    sheet = SpreadsheetApp.openById(Info.template.id)
      .getSheetByName('TTT')
      .copyTo(spreadsheet.spreadsheet)
      .setName(`tmp_${Noise.randomString(5, 'lonum')}`)
      .hideSheet()

    Spreadsheet2.stampSheetWithFinder(sheet, 'TTT')

    return 0
  }

  /**
   * Update to layout 15.
   *
   */
  v0m15p0_ () {
    const sheets = { new: {}, bkp: {} }
    const data = {}
    let r

    r = SpreadsheetApp2.getActive().getSheetByFinder('Dec')
    if (r) {
      r = this.v0m15p0s5_()
      return r
    }

    this.v0m15p0s0_()

    r = this.v0m15p0s1_(sheets)
    if (r !== 0) return r

    r = this.v0m15p0s2_(sheets, data)
    if (r !== 0) return r

    r = this.v0m15p0s3_(data)
    if (r !== 0) return r

    r = this.v0m15p0s4_(sheets, data)
    if (r !== 0) return r

    r = this.v0m15p0s5_(sheets)
    if (r !== 0) return r

    return 0
  }

  /**
   * Update sheet 'Tags'.
   *
   * 0.14.2
   */
  v0m14p2_ () {
    const sheet = SpreadsheetApp2.getActive().getSheetByName('Tags');
    if (!sheet) return 0;

    const maxColumns = sheet.getMaxColumns();
    if (maxColumns < 17) return 0;
    else if (maxColumns > 19) sheet.deleteColumn(18);
    else if (maxColumns < 19) sheet.insertColumnsAfter(17, 19 - maxColumns);

    sheet.getRange('C1:C2').copyTo(sheet.getRange('R1:S2'), { formatOnly: true });
    sheet.getRange('G2:G').copyTo(sheet.getRange('R2:S'), { formatOnly: true });
    sheet.setColumnWidth(18, 127);
    sheet.setColumnWidth(19, 127);
    sheet.getRange('Q1:R').setBorder(null, null, null, null, true, null, '#000000', SpreadsheetApp.BorderStyle.DASHED);

    const range = sheet.getRange('F2:Q');
    const rules = [];

    let rule;

    rule = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=COLUMN() - 5 < INDIRECT("_Settings!B4")')
      .setFontColor('#cccccc')
      .setRanges([range])
      .build();
    rules.push(rule);

    rule = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=COLUMN() - 5 > INDIRECT("_Settings!B4") - 1 + INDIRECT("_Settings!B6")')
      .setFontColor('#999999')
      .setRanges([range])
      .build();
    rules.push(rule);

    sheet.clearConditionalFormatRules();
    sheet.setConditionalFormatRules(rules);

    new MakeSheetTags().makeConfig().make();

    return 0;
  }
}
