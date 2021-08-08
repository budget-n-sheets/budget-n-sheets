class Backup {
  constructor () {
    this._spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();

    this._backup = {
      backup: {},
      ttt: { 0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}, 8: {}, 9: {}, 10: {}, 11: {} },
      cards: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [] },
      tags: [],
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
    for (let i = 0; i < db_accounts.length; i++) {
      const account = db_accounts[i];
      this._backup.db_tables.accounts[i] = {
        name: account.name,
        balance: account.balance,
        time_a: account.time_a,
        time_z: account.time_z
      };
    }
  }

  collectDbCards_ () {
    const db_cards = new CardsService().getAll();
    for (let i = 0; i < db_cards.length; i++) {
      const card = db_cards[i];
      this._backup.db_tables.cards[i] = {
        name: card.name,
        code: card.code,
        limit: card.limit,
        aliases: card.aliases
      };
    }
  }

  collectMonths_ () {
    const numTables = 1 + SettingsConst.getValueOf('number_accounts');

    let mm = 0;
    while (mm < 12) {
      const sheet = this._spreadsheet.getSheetByName(MONTH_NAME.short[i]);
      if (!sheet) continue;

      const numRows = sheet.getLastRow() - 4;
      if (numRows < 1) continue;

      const table = sheet.getRange(5, 1, numRows, 5 * numTables).getValues();
      for (let k = 0; k < numTables; k++) {
        this._backup.ttt[mm][k] = this.filterTable_(table.map(row => row.slice(5 * k, 5 * k + 4)));
      }

      mm++;
    }
  }

  collectProperties_ () {
    const documentProperties = PropertiesService3.document();
    this._backup.user_settings = documentProperties.getProperty('user_settings');
    this._backup.admin_settings = documentProperties.getProperty('admin_settings');
    this._backup.const_properties = documentProperties.getProperty('const_properties');
    this._backup.class_version2 = documentProperties.getProperty('class_version2');

    this._backup.spreadsheet_settings = {
      decimal_places: SettingsSpreadsheet.getValueOf('decimal_places')
    };

    this._backup.user_settings.sha256_financial_calendar = this._backup.user_settings.financial_calendar
      ? Utilities2.computeDigest('SHA_256', this._backup.user_settings.financial_calendar, 'UTF_8')
      : '';

    delete backup.user_settings.financial_calendar;
    delete backup.admin_settings.admin_id;
    delete backup.const_properties.date_created;
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

  filterTable_ (table) {
    let n = table.length - 1;

    do {
      if (table[n].findIndex(e => e !== '') > -1) break;
    } while (--n > -1);

    n++;
    return n > 0 ? table.slice(0, n) : [];
  }

  setMeta_ () {
    this._backup.backup = {
      version: APPS_SCRIPT_GLOBAL.backup_version,
      date_request: DATE_NOW.getTime(),
      spreadsheet_id: this._spreadsheet.getId(),
      spreadsheet_title: this._spreadsheet.getName()
    };
  }

  makeBackup () {
    this.collectMonths_();
    this.collectCards_();
    this.collectTags_();

    this.collectDbAccounts_();
    this.collectDbCards_();

    this.collectProperties_();

    this.setMeta_();

    return this._backup;
  }
}
