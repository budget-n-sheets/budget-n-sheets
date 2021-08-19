class AccountsService extends TablesService {
  constructor () {
    const db = RapidAccess.db().accounts();
    super('db_accounts', db);
  }

  formatValues_ (account) {
    account.name = account.name.trim();
    account.time_start = Number(account.time_start);
    account.balance = Number(account.balance);
  }

  updateMetadata_ () {
    const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('_Backstage');
    if (!sheet) return;

    const metadata = {};

    let k = 0;
    for (const id in this._db) {
      metadata[k] = {};
      Object.assign(metadata[k], this._db[id]);
      k++;
    }

    const list_metadata = sheet.createDeveloperMetadataFinder()
      .withVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
      .withKey('db_accounts')
      .find();

    if (list_metadata.length > 0) {
      list_metadata[0].setValue(JSON.stringify(metadata));
    } else {
      sheet.addDeveloperMetadata(
        'db_accounts',
        JSON.stringify(metadata),
        SpreadsheetApp.DeveloperMetadataVisibility.PROJECT
      );
    }
  }

  updateNames_ () {
    const jan = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('Jan');
    const backstage = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('_Backstage');
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
      rangeOff.offset(1 + _h * acc.time_start, 0).setFormula('=' + FormatNumber.localeSignal(acc.balance));

      if (jan) jan.getRange(1, 6 + 5 * acc.index).setValue(acc.name);
    }
  }

  updateReferences_ () {
    const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('Cash Flow');
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
    this.updateMetadata_();
    this.updateNames_();
    this.updateReferences_();

    SpreadsheetApp.flush();
    return this;
  }

  update (metadata) {
    if (!this.hasId(metadata.id)) return 1;

    this.formatValues_(metadata);
    if (metadata.name === '') return 1;

    const account = this._db[metadata.id];
    metadata.index = account.index;

    for (const key in account) {
      account[key] = metadata[key];
    }

    return this;
  }
}
