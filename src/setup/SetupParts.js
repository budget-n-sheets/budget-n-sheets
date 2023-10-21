/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SetupParts {
  constructor (config) {
    this._h = TABLE_DIMENSION.height
    this._w = TABLE_DIMENSION.width

    this._date = Object.freeze({
      time: Consts.date.getTime(),
      yyyy: Consts.date.getFullYear(),
      mm: Consts.date.getMonth()
    })

    this._config = config
    this._spreadsheet = SpreadsheetApp2.getActive().spreadsheet
    this._spreadsheetId = SpreadsheetApp2.getActive().getId()
    this._metadata = SpreadsheetApp2.getActive().getMetadata()
  }

  setupEast_ () {
    let sheet
    let md, t, i

    const initial_month = this._config.initial_month

    if (this._date.yyyy === this._config.financial_year) {
      t = true
      md = Utils.getMonthDelta(this._date.mm)
    } else {
      t = false
    }

    const sheets = []
    for (i = 0; i < 12; i++) {
      sheets[i] = SpreadsheetApp2.getActive().getSheetByName(Consts.month_name.short[i])
    }

    for (i = 0; i < 12; i++) {
      sheet = sheets[i]

      if (i < initial_month) {
        if (t && (i < this._date.mm + md[0] || i > this._date.mm + md[1])) {
          sheet.setTabColor('#b7b7b7')
        } else {
          sheet.setTabColor('#b7b7b7')
        }
      } else if (t) {
        if (i < this._date.mm + md[0] || i > this._date.mm + md[1]) {
          sheet.setTabColor('#a4c2f4')
        } else {
          sheet.setTabColor('#3c78d8')
        }
      } else {
        sheet.setTabColor('#a4c2f4')
      }
    }

    if (t) {
      sheets[this._date.mm].setTabColor('#6aa84f')
    }

    if (t) {
      for (i = 0; i < 12; i++) {
        sheet = sheets[i]

        if (i < initial_month && (i < this._date.mm + md[0] || i > this._date.mm + md[1])) {
          sheet.hideSheet()
        } else if (i < this._date.mm + md[0] || i > this._date.mm + md[1]) {
          sheet.hideSheet()
        }
      }

      if (this._date.mm === 11) {
        sheets[8].showSheet()
      }
    }

    SpreadsheetApp.flush()
  }

  setupProperties_ () {
    let properties, metadata

    properties = {
      initial_month: this._config.initial_month,
      financial_calendar: '',
      post_day_events: false,
      cash_flow_events: false,
      override_zero: false,
      optimize_load: true
    }
    CachedProperties.withDocument().update('user_settings', properties)

    properties = {
      automatic_backup: false
    }
    CachedProperties.withDocument().update('admin_settings', properties)

    properties = {
      setup_channel: this._config.setup_channel,
      date_created: this._date.time,
      number_accounts: this._config.number_accounts,
      financial_year: this._config.financial_year
    }
    CachedProperties.withDocument().update('const_properties', properties)

    metadata = {
      setup_channel: this._config.setup_channel,
      number_accounts: this._config.number_accounts,
      financial_year: this._config.financial_year
    }

    this._metadata.set('const_properties', metadata)

    properties = {
      view_mode: 'complete',
      decimal_places: this._config.decimal_places,
      decimal_separator: this._config.decimal_separator,
      spreadsheet_locale: this._spreadsheet.getSpreadsheetLocale(),
      optimize_load: [false, false, false, false, false, false, false, false, false, false, false, false]
    }
    CachedProperties.withDocument().update('spreadsheet_settings', properties)

    metadata = {
      decimal_places: this._config.decimal_places
    }

    this._metadata.set('spreadsheet_settings', metadata)
  }

  setupTables_ () {
    const initial_month = this._config.initial_month
    const name_acc = this._config.name_accounts
    const num_acc = this._config.number_accounts

    const db_accounts = {}
    const meta_accounts = {}

    const list_ids = []
    for (let k = 0; k < num_acc; k++) {
      let i = 0
      let id = ''

      do {
        id = Noise.randomString(7, 'lonum')
      } while (list_ids.indexOf(id) !== -1 && ++i < 99)
      if (i >= 99) throw new Error('Could not generate account IDs.')
      list_ids.push(id)

      const account = {
        index: k,
        name: name_acc[k].name,
        balance: 0,
        time_start: initial_month,
        color: 'whitesmoke'
      }

      db_accounts[id] = {}
      Object.assign(db_accounts[id], account)

      delete account.index
      meta_accounts[k] = {}
      Object.assign(meta_accounts[k], account)
    }

    this._metadata.set('db_accounts', meta_accounts)
    CachedProperties.withDocument().update('db_accounts', db_accounts)

    this._metadata.set('db_cards', {})
    CachedProperties.withDocument().update('db_cards', {})
  }

  run () {
    const spreadsheet = SpreadsheetApp2.getActive().spreadsheet
    const sheets = spreadsheet.getSheets()

    this.setupProperties_()
    this.setupTables_()

    new MakeSheetSummary().install()
    new MakeSheetTags().install()
    new MakeSheetCashFlow().install()
    new MakeSheetAbout().install()

    this.setupEast_()

    sheets.forEach(sheet => spreadsheet.deleteSheet(sheet))
    SpreadsheetApp.flush()
    return this
  }
}
