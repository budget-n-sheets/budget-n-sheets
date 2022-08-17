class RestoreCopy {
  constructor (config) {
    this.destination = SpreadsheetApp2.getActive();

    this.source_id = config.file_id;
    this.source = SpreadsheetApp.openById(config.file_id);

    this.metadata = new Metadata(this.source);

    this.name_accounts = config.name_accounts.filter(e => e.require === 'copy');
  }

  copyCards_ () {
    const source = this.source.getSheetByName('Cards');
    if (!source) return;
    const numRows = source.getLastRow() - 5;
    if (numRows < 1) return;

    const destination = this.destination.getSheetByName('Cards');
    new ToolInsertRowsCards().insertRowsTo(5 + numRows, true);

    const values = source.getRange(6, 1, numRows, 6 * 12).getValues();
    destination.getRange(6, 1, numRows, 6 * 12).setValues(values);
  }

  copySettings_ () {
    const metadata = this.metadata.get('user_settings');
    if (metadata.financial_calendar === '') return;

    const calendars = Calendar.listAllCalendars();
    const calendar = CalendarUtils.getMetaByHash('SHA_256', calendars, metadata.financial_calendar);
    if (calendar) {
      SettingsUser.set('financial_calendar', calendar.id)
        .set('post_day_events', metadata.post_day_events)
        .set('cash_flow_events', metadata.cash_flow_events)
        .updateMetadata();
    }
  }

  copyTables_ () {
    if (this.name_accounts.length > 0) {
      const metadata = this.metadata.get('db_accounts');
      const accountsService = new AccountsService();

      this.name_accounts.forEach(e => {
        const acc = accountsService.getByName(e.name);
        if (acc) accountsService.update(acc.id, metadata[e.prevIndex]);
      });
      accountsService.save();
      accountsService.flush();
    }

    const metadata = this.metadata.get('db_cards');
    const cardsService = new CardsService();

    for (const k in metadata) {
      metadata[k].aliases = metadata[k].aliases.join(',');
      cardsService.create(metadata[k]);
    }
    cardsService.save();
    cardsService.flush();
  }

  copyTags_ () {
    const source = this.source.getSheetByName('Tags');
    if (!source) return;
    const numRows = source.getLastRow() - 1;
    if (numRows < 1) return;

    const destination = this.destination.getSheetByName('Tags');
    new ToolInsertRowsTags().insertRowsTo(1 + numRows, true);

    const values = source.getRange(2, 1, numRows, 5).getValues();
    destination.getRange(2, 1, numRows, 5).setValues(values);
  }

  copyTtt_ () {
    let mm = -1;
    while (++mm < 12) {
      const source = this.source.getSheetByName(Consts.month_name.short[mm]);
      if (!source) continue;
      const numRows = source.getLastRow() - 4;
      if (numRows < 1) continue;

      const sheet = this.destination.getSheetByName(Consts.month_name.short[mm]);
      new ToolInsertRowsMonth(mm).insertRowsTo(4 + numRows, true);

      const values = source.getRange(5, 1, numRows, 4).getValues();
      sheet.getRange(5, 1, numRows, 4).setValues(values);

      this.name_accounts.forEach(e => {
        const values = source.getRange(5, 1 + 5 * (1 + e.prevIndex), numRows, 4).getValues();
        sheet.getRange(5, 1 + 5 * (1 + e.index), numRows, 4).setValues(values);
      });
    }
  }

  copy () {
    this.copyTables_();
    this.copyTtt_();
    this.copyCards_();
    this.copyTags_();
    this.copySettings_();
  }
}
