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

    metadata = {
      initial_month: this._config.initial_month,
      financial_calendar: '',
      post_day_events: false,
      cash_flow_events: false
    }
    this._metadata.set('user_settings', metadata)

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

    CachedProperties.withDocument().update('db_accounts', {})
    CachedProperties.withDocument().update('db_cards', {})

    const accountsService = new AccountsService()

    for (let k = 0; k < num_acc; k++) {
      const account = {
        name: name_acc[k].name,
        balance: 0,
        time_start: initial_month,
        color: 'whitesmoke'
      }

      accountsService.create(account)
    }
  }

  setupLayout_ () {
    const spreadsheet2 = SpreadsheetApp2.getActive()
    const spreadsheet = spreadsheet2.spreadsheet

    const financialYear = SettingsConst.get('financial_year')
    const initialMonth = SettingsUser.get('initial_month')
    const monthName = Consts.month_name.short
    const year = Consts.date.getFullYear()
    const month = Consts.date.getMonth()
    const delta = Utils.getMonthDelta(month)

    spreadsheet2.getSheetByName('Summary').activate()
    spreadsheet.moveActiveSheet(1)

    for (let mm = 0; mm < 12; mm++) {
      spreadsheet2.getSheetByName(monthName[mm]).activate()
      spreadsheet.moveActiveSheet(2 + mm)
    }

    spreadsheet2.getSheetByName('Cash Flow').activate()
    spreadsheet.moveActiveSheet(14)

    spreadsheet2.getSheetByName('Tags').activate()
    spreadsheet.moveActiveSheet(15)

    /**
    let sheet

    sheet = spreadsheet2.getSheetByName('_Settings').activate()
    spreadsheet.moveActiveSheet(16)
    sheet.hideSheet()

    sheet = spreadsheet2.getSheetByName('_Backstage').activate()
    spreadsheet.moveActiveSheet(17)
    sheet.hideSheet()

    sheet = spreadsheet2.getSheetByName('_Unique').activate()
    spreadsheet.moveActiveSheet(18)
    sheet.hideSheet()

    sheet = spreadsheet2.getSheetByName('_About BnS').activate()
    spreadsheet.moveActiveSheet(19)
    sheet.hideSheet()
    */

    let mm = year === financialYear ? -1 : 12

    while (++mm < initialMonth) {
      if (mm < month + delta[0] || mm > month + delta[1]) {
        spreadsheet2.getSheetByName(monthName[mm]).hideSheet()
      }
    }

    mm--

    while (++mm < 12) {
      if (mm < month + delta[0] || mm > month + delta[1]) {
        spreadsheet2.getSheetByName(monthName[mm]).hideSheet()
      } else {
        spreadsheet2.getSheetByName(monthName[mm]).setTabColor('#3c78d8')
      }
    }

    if (year === financialYear) spreadsheet2.getSheetByName(monthName[month]).setTabColor('#6aa84f')
  }

  run () {
    const spreadsheet = SpreadsheetApp2.getActive().spreadsheet
    const sheets = spreadsheet.getSheets()

    this.setupProperties_()
    this.setupTables_()

    new MakeSheetUnique().install()
    new MakeSheetSummary().install()
    new MakeSheetAbout().install()

    this.setupLayout_()

    sheets.forEach(sheet => spreadsheet.deleteSheet(sheet))
    SpreadsheetApp.flush()
    return this
  }
}
