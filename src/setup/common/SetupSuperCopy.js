/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SetupSuperCopy {
  constructor (config) {
    this.destination = SpreadsheetApp2.getActive().spreadsheet

    this.source_id = config.file_id
    this.source = SpreadsheetApp.openById(config.file_id)

    this.metadata = new Metadata(this.source)

    this.name_accounts = config.name_accounts.filter(e => e.require === 'copy')
    this.initial_month = Number(config.initial_month)
    this.isTemplatePre15 = config.isTemplatePre15
  }

  copyCards_ () {
    const metadata = JSON.parse(this.metadata.get('db_cards'))
    const cards = new CardsService()

    for (const k in metadata) {
      metadata[k].aliases = metadata[k].aliases.join(',')
      cards.create(metadata[k])
    }

    cards.flush()
  }

  copySettings_ () {
    const metadata = JSON.parse(this.metadata.get('user_settings'))
    if (metadata.financial_calendar === '') return

    const calendars = Calendar.listAllCalendars()
    const calendar = CalendarUtils.getMetaByHash('SHA_256', calendars, metadata.financial_calendar)
    if (calendar) {
      SettingsUser.set('financial_calendar', calendar.id)
        .set('post_day_events', metadata.post_day_events)
        .set('cash_flow_events', metadata.cash_flow_events)
        .updateMetadata()
    }
  }

  copyTags_ () {
    const source = this.source.getSheetByName('Tags')
    if (!source) return
    const numRows = source.getLastRow() - 1
    if (numRows < 1) return

    const destination = this.destination.getSheetByName('Tags')
    new ToolInsertRowsTags().insertRowsTo(1 + numRows, true)

    const values = source.getRange(2, 1, numRows, 5).getValues()
    destination.getRange(2, 1, numRows, 5).setValues(values)
  }
}
