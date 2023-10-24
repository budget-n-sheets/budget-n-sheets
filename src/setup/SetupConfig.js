/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SetupConfig {
  static configCopy_ (uuid, config) {
    const candidate = PropertiesService2.getDocumentProperties().getProperty('settings_candidate')
    if (candidate.uuid !== uuid) throw new Error('UUID does not match.')
    if (candidate.protocol !== 'copy') throw new Error('Protocol does not match.')

    config.file_id = candidate.source.file_id
    config.isTemplatePre15 = BnsTemplate.isPre15(candidate.version.template)

    return config
  }

  static configFollowUp_ (uuid, config) {
    const candidate = PropertiesService2.getDocumentProperties().getProperty('settings_candidate')
    if (candidate.uuid !== uuid) throw new Error('UUID does not match.')
    if (candidate.protocol !== 'follow_up') throw new Error('Protocol does not match.')

    config.file_id = candidate.source.file_id
    config.financial_year = candidate.settings.financial_year + 1
    config.isTemplatePre15 = BnsTemplate.isPre15(candidate.version.template)

    return config
  }

  static configRestore_ (uuid, config) {
    const candidate = PropertiesService2.getDocumentProperties().getProperty('settings_candidate')
    if (candidate.uuid !== uuid) throw new Error('UUID does not match.')
    if (candidate.protocol !== 'restore') throw new Error('Protocol does not match.')

    config.backup = unwrapBackup_(uuid, candidate.source.file_id)
    if (config.backup == null) return

    return config
  }

  static digestConfig (uuid, payload) {
    let config = {}

    switch (payload.protocol) {
      case 'copy':
        config = this.configCopy_(uuid, payload.config)
        break
      case 'follow_up':
        config = this.configFollowUp_(uuid, payload.config)
        break
      case 'new':
        config = Utils.deepCopy(payload.config)
        config.name_accounts = config.name_accounts.filter(e => e.require === 'new')
        break
      case 'restore':
        config = this.configRestore_(uuid, payload.config)
        break

      default:
        throw new Error('SetupConfig: digestConfig(): Switch case is default.')
    }

    config.setup_channel = payload.protocol

    config.spreadsheet_name = config.spreadsheet_name.trim().replace(/\s+/g, ' ').slice(0, 128)
    if (config.spreadsheet_name === '') throw new Error('Invalid spreadsheet name.')

    config.name_accounts.forEach((e, i, a) => {
      a[i].name = e.name.trim().replace(/\s+/g, ' ').slice(0, 64)
      if (a[i].name === '') throw new Error('Invalid account name.')
    })
    config.name_accounts.sort((a, b) => a.index - b.index)

    config.number_accounts = config.name_accounts.length
    if (config.number_accounts < 1) throw new Error('Invalid number of accounts.')

    return config
  }
}
