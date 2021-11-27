/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SetupFollowUp {
  constructor (config) {
    this.destination = SpreadsheetApp2.getActive().spreadsheet;

    this.source_id = config.file_id;
    this.source = SpreadsheetApp.openById(config.file_id);

    this.metadata = new Metadata(this.source);

    this.name_accounts = config.name_accounts.filter(e => e.require === 'copy');
  }

  copyCards_ () {
    const metadata = JSON.parse(this.metadata.get('db_cards'))
    const cards = new CardsService()

    for (const k in metadata) {
      metadata[k].aliases = metadata[k].aliases.join(' ');
      cards.create(metadata[k]);
    }

    cards.save();
    cards.flush();
  }

  forwardInstallments_ () {
    const cards = this.source.getSheetByName('Cards');
    if (!cards) return;
    const numRows = cards.getLastRow() - 5;
    if (numRows < 1) return;

    const tool = new ForwardInstallments();

    let values = cards.getRange(6, 1 + 6 * 11, numRows, 5).getValues();
    values = tool.filterInstallments(values);
    values = tool.getNextInstallments(values);
    if (values.length === 0) return;

    this.destination
      .getSheetByName('Cards')
      .getRange(6, 1, values.length, 5)
      .setValues(values);
  }

  copySettings_ () {
    const metadata = JSON.parse(this.metadata.get('user_settings'))
    if (metadata.financial_calendar === '') return

    const calendars = Calendar.listAllCalendars();
    const calendar = CalendarUtils.getMetaByHash('SHA_256', calendars, metadata.financial_calendar);
    if (calendar) {
      SettingsUser.set('financial_calendar', calendar.id)
        .set('post_day_events', metadata.post_day_events)
        .set('cash_flow_events', metadata.cash_flow_events)
        .updateMetadata()
    }
  }

  setupAccounts_ () {
    if (this.name_accounts.length === 0) return;

    const metadata = JSON.parse(this.metadata.get('db_accounts'))
    const accounts = new AccountsService()

    const backstage = this.source.getSheetByName('_Backstage');
    const balance = backstage ? backstage.getRange(113, 7, 1, 25).getValues() : null;

    this.name_accounts.forEach(e => {
      const meta = metadata[e.prevIndex];
      meta.balance = balance ? balance[0][5 * e.prevIndex] : 0;
      meta.time_start = 0;

      const acc = accounts.getByName(e.name)
      if (acc) accounts.update(acc.id, meta)
    })

    accounts.save();
    accounts.flush();
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

  copy () {
    this.setupAccounts_();

    this.copyCards_();
    this.forwardInstallments_();

    this.copyTags_();
    this.copySettings_();
  }
}
