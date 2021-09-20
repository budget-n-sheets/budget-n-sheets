class RestoreBackup {
  constructor (backup) {
    this.backup = backup;
    this.spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();

    this.num_acc = this.backup.const_properties.number_accounts;
  }

  restoreCards_ () {
    const cards = this.backup.cards;

    const sheet = Spreadsheet2.getSheetByName('Cards');
    const insertRows = new ToolInsertRowsCards();

    let mm = -1;
    while (++mm < 12) {
      if (cards[mm].length === 0) continue;

      insertRows.insertRowsTo(5 + cards[mm].length, true);
      sheet.getRange(6, 1 + 6 * mm, cards[mm].length, 5).setValues(cards[mm]);
    }
  }

  restoreSettings_ () {
    const user_settings = this.backup.user_settings;
    if (!user_settings.sha256_financial_calendar) return;

    const calendars = Calendar.listAllCalendars();
    for (const key in calendars) {
      const digest = Utilities2.computeDigest('SHA_256', calendars[key].id, 'UTF_8');

      if (digest === user_settings.sha256_financial_calendar) {
        SettingsUser.setValueOf('financial_calendar', calendars[key].id);
        SettingsUser.setValueOf('post_day_events', user_settings.post_day_events);
        SettingsUser.setValueOf('cash_flow_events', user_settings.cash_flow_events);
        break;
      }
    }
  }

  restoreTables_ () {
    const db_tables = this.backup.db_tables;

    const accountsService = new AccountsService();
    const db_accounts = accountsService.getAll();
    for (const id in db_accounts) {
      const k = db_accounts[id].index;
      accountsService.update(id, db_tables.accounts[k]);
    }
    accountsService.save();
    accountsService.flush();

    const cardsService = new CardsService();
    for (const i in this.backup.db_tables.cards) {
      db_tables.cards[i].aliases = db_tables.cards[i].aliases.join(',');
      cardsService.create(db_tables.cards[i]);
    }
    cardsService.save();
    cardsService.flush();
  }

  restoreTags_ () {
    if (this.backup.tags.length < 1) return;

    new ToolInsertRowsTags().insertRowsTo(1 + this.backup.tags.length, true);
    Spreadsheet2.getSheetByName('Tags')
      .getRange(2, 1, this.backup.tags.length, 5)
      .setValues(this.backup.tags);
  }

  restoreTtt_ () {
    const ttt = this.backup.ttt;

    let mm = -1;
    while (++mm < 12) {
      if (ttt[mm] == null) continue;

      const sheet = Spreadsheet2.getSheetByName(Consts.month_name.short[mm]);
      const insertRows = new ToolInsertRowsMonth(mm);

      for (let k = 0; k < 1 + this.num_acc; k++) {
        if (ttt[mm][k] == null) continue;
        if (ttt[mm][k].length === 0) continue;

        insertRows.insertRowsTo(4 + ttt[mm][k].length, true);
        sheet.getRange(5, 1 + 5 * k, ttt[mm][k].length, 4).setValues(ttt[mm][k]);
      }
    }
  }

  restore () {
    this.restoreTables_();
    this.restoreTtt_();
    this.restoreCards_();
    this.restoreTags_();
    this.restoreSettings_();
  }
}
