/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class RestoreBackup {
  constructor (config) {
    this.backup = config.backup;
    this.spreadsheet = SpreadsheetApp2.getActive().spreadsheet;

    this.name_accounts = config.name_accounts.filter(e => e.require === 'restore');
  }

  restoreCards_ () {
    const cards = this.backup.cards;

    const sheet = SpreadsheetApp2.getActive().getSheetByName('Cards');
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
      SettingsUser.set('financial_calendar', calendar.id)
        .set('post_day_events', user_settings.post_day_events)
        .set('cash_flow_events', user_settings.cash_flow_events)
        .updateMetadata();
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
    SpreadsheetApp2.getActive().getSheetByName('Tags')
      .getRange(2, 1, this.backup.tags.length, 5)
      .setValues(this.backup.tags);
  }

  restoreTagsCategories_ () {
    const categories = this.backup.tags_categories.concat(Consts.tags_categories);
    TagsService.setCategories(categories);
  }

  restoreTtt_ () {
    const ttt = this.backup.ttt;
    const names = this.name_accounts.slice().map(a => a.name)
    names.push('Wallet')

    for (let mm = 0; mm < 12; mm++) {
      if (ttt[mm].length === 0) continue
      const a = ttt[mm].filter(w => names.indexOf(w[0]) > -1)
      new LedgerTtt(mm).mergeTransactions(a)
    }
  }

  restore () {
    this.restoreTables_();
    this.restoreTtt_();
    this.restoreTags_();
    this.restoreTagsCategories_();
    this.restoreSettings_();
  }
}
