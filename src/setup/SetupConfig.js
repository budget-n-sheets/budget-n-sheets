class SetupConfig {
  static configCopy_ (uuid, config) {
    const candidate = PropertiesService3.document().getProperty('settings_candidate');
    if (candidate.uuid !== uuid) throw new Error('UUID does not match.');
    if (candidate.protocol !== 'copy') throw new Error('Protocol does not match.');

    config.file_id = candidate.source.file_id;

    config.name_accounts.forEach((e, i, a) => a[i] = e.name);

    config.spreadsheet_name = candidate.settings.spreadsheet_name;
    config.decimal_places = candidate.settings.decimal_places;

    config.initial_month = candidate.settings.initial_month;

    candidate.settings.financial_year = config.financial_year;
    PropertiesService3.document().setProperty('settings_candidate', candidate);

    return config;
  }

  static configRestore_ (uuid, config) {
    const candidate = PropertiesService3.document().getProperty('settings_candidate');
    if (candidate.uuid !== uuid) throw new Error('UUID does not match.');
    if (candidate.protocol !== 'restore') throw new Error('Protocol does not match.');

    const blob = DriveApp.getFileById(candidate.source.file_id).getBlob();
    config.backup = unwrapBackup_(uuid, blob, candidate.source.file_id);
    if (config.backup == null) return;

    config.name_accounts.forEach((e, i, a) => a[i] = e.name);

    config.spreadsheet_name = candidate.settings.spreadsheet_name;
    config.decimal_places = candidate.settings.decimal_places;

    config.initial_month = candidate.settings.initial_month;

    candidate.settings.financial_year = config.financial_year;
    PropertiesService3.document().setProperty('settings_candidate', candidate);

    return config;
  }

  static digestConfig (uuid, payload) {
    let config = {};

    switch (payload.protocol) {
      case 'copy':
        config = this.configCopy_(uuid, payload.config);
        break;
      case 'new':
        break;
      case 'restore':
        config = this.configRestore_(uuid, payload.config);
        break;

      default:
        throw new Error('SetupConfig: digestConfig(): Switch case is default.');
    }

    config.spreadsheet_name = config.spreadsheet_name.trim();
    if (config.spreadsheet_name === '') throw new Error('Invalid spreadsheet name.');

    for (let i = 0; i < config.name_accounts.length; i++) {
      config.name_accounts[i] = config.name_accounts[i].trim();
      if (config.name_accounts[i] === '') throw new Error('Invalid account name.');
    }

    config.number_accounts = config.name_accounts.length;

    return config;
  }
}
