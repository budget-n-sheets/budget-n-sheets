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
    this.backup = config.backup
    this.spreadsheet = SpreadsheetApp2.getActive().spreadsheet

    this.name_accounts = config.name_accounts
    this.dropAccounts = config.accounts
      .filter(e => e.command === 'drop')
      .map(acc => acc.name)
  }

  restoreSettings_ () {
    const user_settings = this.backup.user_settings
    if (!user_settings.financial_calendar) return

    const calendars = Calendar.listAllCalendars()
    const calendar = CalendarUtils.getMetaByHash('SHA_256', calendars, user_settings.financial_calendar)
    if (calendar) {
      SettingsUser.set('financial_calendar', calendar.id)
        .set('post_day_events', user_settings.post_day_events)
        .set('cash_flow_events', user_settings.cash_flow_events)
        .updateMetadata()
    }
  }

  restoreTables_ () {
    const db_tables = this.backup.db_tables

    if (this.name_accounts.length > 0) {
      const accountsService = new AccountsService()

      this.name_accounts.forEach(e => {
        const acc = accountsService.getByName(e.name)
        if (acc) {
          acc.data = db_tables.accounts[e.key]
          accountsService.update(acc)
        }
      })
      accountsService.flush()
    }

    const cardsService = new CardsService()
    for (const i in this.backup.db_tables.cards) {
      db_tables.cards[i].aliases = db_tables.cards[i].aliases.join(',')
      cardsService.create(db_tables.cards[i])
    }
    cardsService.flush()
  }

  restoreTags_ () {
    if (this.backup.tags.length < 1) return

    const sheet = SpreadsheetApp2.getActive().getSheetByName('Tags')
    InsertRows.insertRowsTo(sheet, 1 + this.backup.tags.length, true)
    sheet.getRange(2, 1, this.backup.tags.length, 5).setValues(this.backup.tags)
  }

  restoreTagsCategories_ () {
    const categories = this.backup.tags_categories.concat(Consts.tags_categories)
    TagsService.setCategories(categories)
  }

  restoreTtt_ () {
    const ttt = this.backup.ttt

    for (let mm = 0; mm < 12; mm++) {
      if (ttt[mm].length === 0) continue
      const a = ttt[mm].filter(w => this.dropAccounts.indexOf(w[0]) === -1)
      new LedgerTtt(mm).mergeTransactions(a)
    }
  }

  restore () {
    this.restoreTables_()
    this.restoreTtt_()
    this.restoreTags_()
    this.restoreTagsCategories_()
    this.restoreSettings_()
  }
}
