class AccountsService extends TablesService {
  constructor () {
    const db = RapidAccess.db().accounts();
    super('accounts', db);
  }

  updateMetadata_ () {
    const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('Jan');
    if (!sheet) return;

    const metadata = [];
    for (let k = 0; k < this._db.data.length; k++) {
      metadata[k] = {};
      Object.assign(metadata[k], this._db.data[k]);
      delete metadata[k].id;
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

    let k = 0;
    while (k < this._db.ids.length) {
      const account = this._db.data[k];
      const col = 2 + _w + _w * k;
      const rangeOff = backstage.getRange(1, col);

      const list = [];
      for (let i = 1; i < 12; i++) {
        list[i - 1] = RangeUtils.rollA1Notation(2 + _h * i, col);
      }

      rangeOff.setValue(account.name);
      rangeOff.offset(1, 0).setFormula('0');
      backstage.getRangeList(list).setFormulaR1C1('R[-' + (_h - 1) + ']C');
      rangeOff.offset(1 + _h * account.time_a, 0).setFormula('=' + FormatNumber.localeSignal(account.balance));

      if (jan) jan.getRange(1, 6 + 5 * k).setValue(account.name);
      k++;
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

    for (let k = 0; k < number_accounts; k++) {
      const mm = this._db.data[k].time_a;
      formulas[mm] += ' + _Backstage!' + ranges[k] + (2 + _h * mm);
    }

    const rangeOff = sheet.getRange(4, 3);
    for (let i = 0; i < 12; i++) {
      rangeOff.offset(0, 4 * i).setFormula(formulas[i]);
    }
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

    metadata.name = metadata.name.trim();
    if (metadata.name === '') return 1;

    const c = this._db.ids.indexOf(metadata.id);

    metadata.time_a = Number(metadata.time_a);
    metadata.balance = Number(metadata.balance);

    this._db.names[c] = metadata.name;

    this._db.data[c].name = metadata.name;
    this._db.data[c].time_a = metadata.time_a;
    this._db.data[c].balance = metadata.balance;

    return this;
  }
}
