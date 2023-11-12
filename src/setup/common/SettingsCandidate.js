/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SettingsCandidate {
  static processBackup (uuid, file, data) {
    if (!FeatureFlag.getStatusOf('setup/restore')) throw new Error('Feature flagged.')

    const settings_candidate = {
      protocol: 'restore',
      source: {
        file_id: file.getId(),
        file_url: '',
        file_name: file.getName(),
        type: 'JSON',
        date_created: new Date(data.metadata.date_request).toString()
      },
      settings: {
        spreadsheet_name: data.metadata.spreadsheet_name,
        financial_year: data.const_properties.financial_year,
        initial_month: data.user_settings.initial_month,
        decimal_places: data.spreadsheet_settings.decimal_places,
        financial_calendar: data.user_settings.financial_calendar,
        accounts: []
      },
      misc: {
        cards: [],
        tags: 0
      }
    }

    for (const k in data.db_tables.accounts) {
      settings_candidate.settings.accounts.push({
        id: 'acc_' + k,
        prevIndex: +k,

        require: 'restore',
        index: +k,
        name: data.db_tables.accounts[k].name
      })
    }

    for (const k in data.db_tables.cards) {
      settings_candidate.misc.cards.push(data.db_tables.cards[k].name)
    }

    cacheSettingsSummary_(uuid, settings_candidate)
    return 0
  }

  static processSpreadsheet (uuid, fileId) {
    if (!FeatureFlag.getStatusOf(`setup/${protocol}`)) throw new Error('Feature flagged.')

    const spreadsheet = SpreadsheetApp.openById(fileId)
    const metadata = new Metadata(spreadsheet)
    let property

    const settings_candidate = {
      protocol,
      version: {
        script: {},
        template: {}
      },
      source: {
        file_id: fileId,
        file_url: spreadsheet.getUrl(),
        type: 'GOOGLE_SHEETS'
      },
      settings: {
        spreadsheet_name: spreadsheet.getName(),
        financial_year: Consts.date.getFullYear(),
        initial_month: Consts.date.getMonth(),
        decimal_places: 2,
        financial_calendar: '',
        accounts: []
      },
      misc: {
        cards: [],
        tags: 0
      }
    }

    property = JSON.parse(metadata.get('class_version2'))
    if (!property) throw new Error('Property not found.')

    let isEOS = BnsScript.isEndOfSupport(property.script)
    if (isEOS) throw new Error('Version not supported.')

    isEOS = BnsTemplate.isEndOfSupport(property.template)
    if (isEOS) throw new Error('Version not supported.')

    Object.assign(settings_candidate.version.script, property.script)
    Object.assign(settings_candidate.version.template, property.template)

    property = JSON.parse(metadata.get('const_properties'))
    if (!property) throw new Error('Property not found.')
    settings_candidate.settings.financial_year = property.financial_year

    property = JSON.parse(metadata.get('user_settings'))
    if (!property) throw new Error('Property not found.')
    settings_candidate.settings.initial_month = property.initial_month
    settings_candidate.settings.financial_calendar = property.financial_calendar

    property = JSON.parse(metadata.get('spreadsheet_settings'))
    settings_candidate.settings.decimal_places = property?.decimal_places || 2

    property = JSON.parse(metadata.get('db_accounts'))
    if (!property) throw new Error('Property not found.')
    for (const k in property) {
      settings_candidate.settings.accounts.push({
        id: 'acc_' + k,
        prevIndex: +k,

        require: 'copy',
        index: +k,
        name: property[k].name
      })
    }

    property = JSON.parse(metadata.get('db_cards'))
    if (!property) throw new Error('Property not found.')
    for (const k in property) {
      settings_candidate.misc.cards.push(property[k].name)
    }

    const sheet = spreadsheet.getSheetByName('Tags')
    if (sheet) settings_candidate.misc.tags = sheet.getLastRow() - 1

    cacheSettingsSummary_(uuid, settings_candidate)
  }
}
