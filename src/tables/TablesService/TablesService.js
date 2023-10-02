/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class TablesService {
  constructor (key, db) {
    this.spreadsheet = null;
    this.formater = new FormatNumber();

    this._key = key;
    this._db = db;

    this._ids = Object.keys(db);
  }

  getNextIndex_ () {
    const indexes = [];
    for (const id in this._db) {
      indexes.push(this._db[id].index);
    }

    let index = 0;
    while (indexes.indexOf(index) !== -1) { index++; }

    return index;
  }

  initSpreadsheet_ () {
    if (this.spreadsheet == null) this.spreadsheet = SpreadsheetApp2.getActive().spreadsheet;
  }

  static updateRules () {
    const db_accounts = new AccountsService().getAll()
    const db_cards = new CardsService().getAll()

    const list = ['Wallet']
    const names = ['Wallet']

    for (const id in db_accounts) {
      const acc = db_accounts[id]
      list.push(acc.name)
      names.push(acc.name)
    }

    for (const id in db_cards) {
      const card = db_cards[id]
      list.push(card.code)
      names.push(card.code)
      names.push(...card.aliases)
    }

    const rule1 = SpreadsheetApp.newDataValidation()
      .requireValueInList(list, true)
      .setAllowInvalid(true)
      .build()

    const rule2 = SpreadsheetApp.newDataValidation()
      .requireValueInList(names, true)
      .setAllowInvalid(true)
      .build()

    for (let i = 0; i < 12; i++) {
      const sheet = SpreadsheetApp2.getActive().getSheetByName(Consts.month_name.short[i])
      if (!sheet) continue
      const numRows = sheet.getMaxRows() - 4
      if (numRows < 1) continue

      sheet.getRange(1, 2)
        .clearDataValidations()
        .setDataValidation(rule1);

      sheet.getRange(5, 2, numRows, 1)
        .clearDataValidations()
        .setDataValidation(rule2);
    }

    SpreadsheetApp.flush();
  }

  static updateConditionalColor () {
    const db_accounts = new AccountsService().getAll()
    const db_cards = new CardsService().getAll()

    const colors = {
      whitesmoke: [],
      slategray: [],
      black: [],
      darkblue: [],
      slateblue: [],
      lightskyblue: [],
      seagreen: [],
      mediumseagreen: [],
      crimson: [],
      deeppink: [],
      darkorange: [],
      goldenrod: []
    }

    for (const id in db_accounts) {
      const acc = db_accounts[id]
      colors[acc.color].push(acc.name)
    }

    for (const id in db_cards) {
      const card = db_cards[id]
      colors[card.color].push(card.code)
      colors[card.color] = colors[card.color].concat(card.aliases)
    }

    delete colors.whitesmoke

    for (const color in colors) {
      if (colors[color].length === 0) delete colors[color]
      else colors[color] = colors[color].join('|')
    }

    for (let i = 0; i < 12; i++) {
      const sheet = SpreadsheetApp2.getActive().getSheetByName(Consts.month_name.short[i])
      if (!sheet) continue
      const numRows = sheet.getMaxRows() - 4
      if (numRows < 1) continue

      const rules = []
      let rule

      rule = SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied(`=REGEXMATCH(${RangeUtils.rollA1Notation(5, 6, 1, 1, 2)}; "#(dp|wd|qcc|inc|trf)")`)
        .setBackground('#d9d2e9')
        .setRanges([sheet.getRange(5, 3, numRows, 5)])
        .build()
      rules.push(rule)

      rule = SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied(`=${RangeUtils.rollA1Notation(5, 7, 1, 1, 2)}`)
        .setFontColor('#999999')
        .setRanges([sheet.getRange(5, 2, numRows, 6)])
        .build()
      rules.push(rule)

      for (const color in colors) {
        const rule = SpreadsheetApp.newConditionalFormatRule()
          .whenFormulaSatisfied(`=REGEXMATCH(${RangeUtils.rollA1Notation(5, 2, 1, 1, 2)}; "${colors[color]}")`)
          .setRanges([sheet.getRange(5, 2, numRows, 1)])
          .setBold(true)
        if (color !== 'black') rule.setFontColor(`#${Consts.color_palette[color]}`)
        rules.push(rule.build())
      }

      sheet.clearConditionalFormatRules()
      sheet.setConditionalFormatRules(rules)
    }

    SpreadsheetApp.flush()
  }

  getAll () {
    return Utils.deepCopy(this._db);
  }

  getAny () {
    const n = this._ids.length;
    if (n < 1) return null;

    const i = Noise.randomInteger(n);
    const id = this._ids[i];
    return { id: id, metadata: Utils.deepCopy(this._db[id]) };
  }

  getById (id) {
    return Utils.deepCopy(this._db[id]);
  }

  hasId (id) {
    return this._ids.indexOf(id) !== -1;
  }

  save () {
    CachedProperties.withDocument().update(this._key, this._db);
    this._ids = Object.keys(this._db);
  }
}
