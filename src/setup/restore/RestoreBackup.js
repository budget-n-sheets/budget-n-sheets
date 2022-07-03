class RestoreBackup {
  constructor (config) {
    this.backup = config.backup;
    this.spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();

    this.name_accounts = config.name_accounts.filter(e => e.require === 'restore');
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
    if (!user_settings.financial_calendar) return;

    const calendars = Calendar.listAllCalendars();
    const calendar = CalendarUtils.getMetaByHash('SHA_256', calendars, user_settings.financial_calendar);
    if (calendar) {
      SettingsUser.setValueOf('financial_calendar', calendar.id);
      SettingsUser.setValueOf('post_day_events', user_settings.post_day_events);
      SettingsUser.setValueOf('cash_flow_events', user_settings.cash_flow_events);
    }
  }

  restoreTables_ () {
    const db_tables = this.backup.db_tables;

    if (this.name_accounts.length > 0) {
      const accountsService = new AccountsService();

      this.name_accounts.forEach(e => {
        const acc = accountsService.getByName(e.name);
        if (acc) accountsService.update(acc.id, db_tables.accounts[e.prevIndex]);
      });
      accountsService.save();
      accountsService.flush();
    }

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

  restoreTagsCategories_ () {
    const categories = this.backup.tags_categories.concat(Consts.tags_categories);
    TagsService.setCategories(categories);
  }

  restoreTtt_ () {
    const ttt = this.backup.ttt;

    let mm = -1;
    while (++mm < 12) {
      const sheet = Spreadsheet2.getSheetByName(Consts.month_name.short[mm]);
      const insertRows = new ToolInsertRowsMonth(mm);

      if (ttt[mm][0] && ttt[mm][0].length > 0) {
        insertRows.insertRowsTo(4 + ttt[mm][0].length, true);
        sheet.getRange(5, 1, ttt[mm][0].length, 4).setValues(ttt[mm][0]);
      }

      this.name_accounts.forEach(e => {
        const numRows = ttt[mm][1 + e.prevIndex]?.length || 0;
        if (numRows > 0) {
          insertRows.insertRowsTo(4 + numRows, true);
          sheet.getRange(5, 1 + 5 * (1 + e.index), numRows, 4).setValues(ttt[mm][1 + e.prevIndex]);
        }
      });
    }
  }

  restore () {
    this.restoreTables_();
    this.restoreTtt_();
    this.restoreCards_();
    this.restoreTags_();
    this.restoreTagsCategories_();
    this.restoreSettings_();
  }
}
