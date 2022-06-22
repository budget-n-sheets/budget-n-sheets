class AccountsService extends TablesService {
  constructor () {
    const db = RapidAccess.db().accounts();
    super('db_accounts', db);
  }

  formatValues_ (account) {
    account.name = account.name.trim().replace(/\s+/g, " ").slice(0, 64);
    account.time_start = Number(account.time_start);
    account.balance = Number(account.balance);
    account.color = 'whitesmoke';
  }

  updateMetadata_ () {
    const metadata = {};

    let k = 0;
    for (const id in this._db) {
      metadata[k] = {};
      Object.assign(metadata[k], this._db[id]);
      k++;
    }

    new Metadata().update('db_accounts', metadata);
  }

  updateNames_ () {
    const jan = this.spreadsheet.getSheetByName('Jan');
    const backstage = this.spreadsheet.getSheetByName('_Backstage');
    if (!backstage) return;

    const _h = TABLE_DIMENSION.height;
    const _w = TABLE_DIMENSION.width;

    for (const id in this._db) {
      const acc = this._db[id];

      const col = 2 + _w + _w * acc.index;
      const rangeOff = backstage.getRange(1, col);

      const list = [];
      for (let i = 1; i < 12; i++) {
        list[i - 1] = RangeUtils.rollA1Notation(2 + _h * i, col);
      }

      rangeOff.setValue(acc.name);
      rangeOff.offset(1, 0).setFormula('0');
      backstage.getRangeList(list).setFormulaR1C1('R[-' + (_h - 1) + ']C');
      rangeOff.offset(1 + _h * acc.time_start, 0).setFormula('=' + this.formater.localeSignal(acc.balance));

      if (jan) jan.getRange(1, 6 + 5 * acc.index).setValue(acc.name);
    }
  }

  updateReferences_ () {
    const sheet = this.spreadsheet.getSheetByName('Cash Flow');
    if (!sheet) return;

    const _h = TABLE_DIMENSION.height;
    const ranges = ['G', 'L', 'Q', 'V', 'AA'];

    const number_accounts = SettingsConst.getValueOf('number_accounts');
    const financial_year = SettingsConst.getValueOf('financial_year');

    const formulas = ['=0 + B4'];
    for (let i = 1; i < 12; i++) {
      const dd = new Date(financial_year, i, 0).getDate();
      formulas[i] = '=' + RangeUtils.rollA1Notation(3 + dd, 4 * i - 1) + ' + ' + RangeUtils.rollA1Notation(4, 2 + 4 * i);
    }

    for (const id in this._db) {
      const acc = this._db[id];
      const mm = acc.time_start;

      formulas[mm] += ' + _Backstage!' + ranges[acc.index] + (2 + _h * mm);
    }

    const rangeOff = sheet.getRange(4, 3);
    for (let i = 0; i < 12; i++) {
      rangeOff.offset(0, 4 * i).setFormula(formulas[i]);
    }
  }

  create (metadata) {
    this.formatValues_(metadata);
    if (metadata.name === '') return 1;

    const id = TablesUtils.getUtid();
    if (!id) return 1;

    const account = {
      index: 0,
      name: '',
      balance: 0,
      time_start: 0
    };

    for (const key in account) {
      account[key] = metadata[key];
    }
    account.index = this.getNextIndex_();

    this._db[id] = {};
    Object.assign(this._db[id], account);

    return this;
  }

  flush () {
    this.initSpreadsheet_();

    this.updateMetadata_();
    this.updateNames_();
    this.updateReferences_();

    SpreadsheetApp.flush();
    return this;
  }

  getByName (name) {
    for (const id in this._db) {
      if (name === this._db[id].name) return { id: id, metadata: Utils.deepCopy(this._db[id]) };
    }

    return null;
  }

  getNamesRegExp () {
    const names = [];
    for (const id in this._db) {
      names.push(this._db[id].name);
    }

    const regExp = names.sort((a, b) => b.length - a.length)
      .map(e => e.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'))
      .join('|');
    return new RegExp('(' + regExp + ')', 'g');
  }

  update (id, metadata) {
    if (!this.hasId(id)) return 1;

    this.formatValues_(metadata);
    if (metadata.name === '') return 1;

    const account = this._db[id];
    metadata.index = account.index;

    for (const key in account) {
      account[key] = metadata[key];
    }

    return this;
  }
}
