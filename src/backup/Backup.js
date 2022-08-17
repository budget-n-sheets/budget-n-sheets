class Backup {
  constructor () {
    this._spreadsheet = SpreadsheetApp2.getActive();
    this._backup = {
      metadata: {},
      ttt: { 0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}, 8: {}, 9: {}, 10: {}, 11: {} },
      cards: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [] },
      tags: [],
      tags_categories: [],
      db_tables: {
        accounts: {},
        cards: {}
      },
      admin_settings: {},
      user_settings: {},
      spreadsheet_settings: {},
      const_properties: {},
      class_version2: {}
    };
  }

  collectCards_ () {
    const sheet = this._spreadsheet.getSheetByName('Cards');
    if (!sheet) return;

    const numRows = sheet.getLastRow() - 5;
    if (numRows < 1) return;

    const table = sheet.getRange(6, 1, numRows, 6 * 12).getValues();
    for (let mm = 0; mm < 12; mm++) {
      this._backup.cards[mm] = this.filterTable_(table.map(row => row.slice(6 * mm, 6 * mm + 5)));
    }
  }

  collectDbAccounts_ () {
    const db_accounts = new AccountsService().getAll();
    let k = 0;
    for (const id in db_accounts) {
      const account = db_accounts[id];
      this._backup.db_tables.accounts[k] = {
        name: account.name,
        balance: account.balance,
        time_start: account.time_start,
        color: account.color
      };
      k++;
    }
  }

  collectDbCards_ () {
    const db_cards = new CardsService().getAll();
    let k = 0;
    for (const id in db_cards) {
      const card = db_cards[id];
      this._backup.db_tables.cards[k] = {
        name: card.name,
        code: card.code,
        limit: card.limit,
        aliases: card.aliases,
        color: card.color
      };
      k++;
    }
  }

  collectMonths_ () {
    const numTables = 1 + SettingsConst.get('number_accounts');

    for (let mm = 0; mm < 12; mm++) {
      const sheet = this._spreadsheet.getSheetByName(Consts.month_name.short[mm]);
      if (!sheet) continue;

      const numRows = sheet.getLastRow() - 4;
      if (numRows < 1) continue;

      const table = sheet.getRange(5, 1, numRows, 5 * numTables).getValues();
      for (let k = 0; k < numTables; k++) {
        this._backup.ttt[mm][k] = this.filterTable_(table.map(row => row.slice(5 * k, 5 * k + 4)));
      }
    }
  }

  collectProperties_ () {
    const documentProperties = PropertiesService2.getDocumentProperties();
    this._backup.user_settings = documentProperties.getProperty('user_settings');
    this._backup.admin_settings = documentProperties.getProperty('admin_settings');
    this._backup.const_properties = documentProperties.getProperty('const_properties');
    this._backup.class_version2 = documentProperties.getProperty('class_version2');

    this._backup.spreadsheet_settings = {
      decimal_places: SettingsSpreadsheet.get('decimal_places')
    };

    this._backup.user_settings.financial_calendar = this._backup.user_settings.financial_calendar
      ? Utilities2.computeDigest('SHA_256', this._backup.user_settings.financial_calendar, 'UTF_8')
      : '';

    delete this._backup.user_settings.financial_calendar;
    delete this._backup.admin_settings.admin_id;
    delete this._backup.const_properties.date_created;
    delete this._backup.const_properties.setup_channel;
  }

  collectTags_ () {
    const sheet = this._spreadsheet.getSheetByName('Tags');
    if (!sheet) return;

    const numRows = sheet.getLastRow() - 1;
    if (numRows < 1) return;

    const table = sheet.getRange(2, 1, numRows, 5).getValues();

    let n = numRows;
    while (--n > -1) {
      if (table[n][0] !== '' || table[n][2] !== '' || table[n][4] !== '') break;
    }

    n++;
    this._backup.tags = n > 0 ? table.slice(0, n) : [];
  }

  collectTagsCategories_ () {
    const init = Consts.tags_categories;
    this._backup.tags_categories = TagsService.getCategories().filter(c => init.indexOf(c) === -1);
  }

  filterTable_ (table) {
    let n = table.length - 1;

    do {
      if (table[n].findIndex(e => e !== '') > -1) break;
    } while (--n > -1);

    n++;
    return n > 0 ? table.slice(0, n) : [];
  }

  setMeta_ () {
    this._backup.metadata = {
      version: Info.backup.version,
      date_request: Consts.date.getTime(),
      spreadsheet_id: this._spreadsheet.getId(),
      spreadsheet_name: this._spreadsheet.getName()
    };
  }

  makeBackup () {
    this.collectMonths_();
    this.collectCards_();
    this.collectTags_();
    this.collectTagsCategories_();

    this.collectDbAccounts_();
    this.collectDbCards_();

    this.collectProperties_();

    this.setMeta_();

    return this._backup;
  }
}
