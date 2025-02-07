/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class Backup {
  constructor () {
    this._spreadsheet = SpreadsheetApp2.getActive().spreadsheet
    this._backup = {
      metadata: {},
      ttt: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [] },
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
    }
  }

  collectDbAccounts_ () {
    let k = 0
    const accounts = new AccountsService().list()
    for (const acc of accounts) {
      this._backup.db_tables.accounts[k] = acc.data
      delete this._backup.db_tables.accounts[k].index
      k++
    }
  }

  collectDbCards_ () {
    let k = 0
    const cards = new CardsService().list()
    for (const card of cards) {
      this._backup.db_tables.cards[k] = card.data
      delete this._backup.db_tables.cards[k].index
      k++
    }
  }

  collectMonths_ () {
    for (let mm = 0; mm < 12; mm++) {
      const sheet = this._spreadsheet.getSheetByName(Consts.month_name.short[mm])
      if (!sheet) continue

      const numRows = sheet.getLastRow() - 5
      if (numRows < 1) continue

      const table = sheet.getRange(6, 2, numRows, 6).getValues()

      this._backup.ttt[mm] = Utils.sliceBlankRows(table.map(row => row.slice(0, 6)))
    }
  }

  collectProperties_ () {
    const documentProperties = PropertiesService2.getDocumentProperties()
    this._backup.user_settings = documentProperties.getProperty('user_settings')
    this._backup.admin_settings = documentProperties.getProperty('admin_settings')
    this._backup.const_properties = documentProperties.getProperty('const_properties')
    this._backup.class_version2 = documentProperties.getProperty('class_version2')

    this._backup.spreadsheet_settings = {
      decimal_places: SettingsSpreadsheet.get('decimal_places')
    }

    this._backup.user_settings.financial_calendar = this._backup.user_settings.financial_calendar
      ? Utilities2.computeDigest('SHA_256', this._backup.user_settings.financial_calendar, 'UTF_8')
      : ''

    delete this._backup.user_settings.financial_calendar
    delete this._backup.admin_settings.admin_id
    delete this._backup.const_properties.date_created
    delete this._backup.const_properties.setup_channel
  }

  collectTags_ () {
    const sheet = this._spreadsheet.getSheetByName('Tags')
    if (!sheet) return

    const numRows = sheet.getLastRow() - 1
    if (numRows < 1) return

    const table = sheet.getRange(2, 1, numRows, 5).getValues()

    let n = numRows
    while (--n > -1) {
      if (table[n][0] !== '' || table[n][2] !== '' || table[n][4] !== '') break
    }

    n++
    this._backup.tags = n > 0 ? table.slice(0, n) : []
  }

  collectTagsCategories_ () {
    const init = Consts.tags_categories
    this._backup.tags_categories = TagsService.getCategories().filter(c => init.indexOf(c) === -1)
  }

  setMeta_ () {
    this._backup.metadata = {
      version: Info.backup.version,
      date_request: Consts.date.getTime(),
      spreadsheet_id: this._spreadsheet.getId(),
      spreadsheet_name: this._spreadsheet.getName()
    }
  }

  makeBackup () {
    this.collectMonths_()
    this.collectTags_()
    this.collectTagsCategories_()

    this.collectDbAccounts_()
    this.collectDbCards_()

    this.collectProperties_()

    this.setMeta_()

    return this._backup
  }
}
