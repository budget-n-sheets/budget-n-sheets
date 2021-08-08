class SetupConfig {
  static configCopy_ (config) {
    const candidate = PropertiesService3.document().getProperty('settings_candidate');
    if (candidate.file_id !== config.file_id) throw new Error('File ID does not match.');

    for (const key in candidate) {
      config[key] = candidate[key];
    }

    config.file_id = candidate.file_id;

    config.spreadsheet_name = candidate.spreadsheet_title;
    config.decimal_places = 2;

    config.financial_year = payload.config.financial_year;

    config.number_accounts = candidate.accounts.length;
    config.name_accounts = candidate.accounts;

    return config;
  }

  static configRestore_ (uuid, config) {
    const candidate = PropertiesService3.document().getProperty('settings_candidate');
    if (candidate.file_id !== config.file_id) throw new Error('File ID does not match.');

    const blob = DriveApp.getFileById(config.file_id).getBlob();
    config.backup = unwrapBackup_(uuid, blob, config.file_id);
    if (config.backup == null) return;

    candidate.financial_year = config.financial_year;
    for (const key in candidate) {
      config[key] = candidate[key];
    }

    config.spreadsheet_name = candidate.spreadsheet_title;
    config.name_accounts = candidate.list_acc;

    return config;
  }

  static digestConfig (payload) {
    let config = payload.config;

    switch (payload.protocol) {
      case 'copy':
        config = this.configCopy_(config);
        break;
      case 'new':
        break;
      case 'restore':
        config = this.configRestore_(payload.uuid, config);
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

    return config;
  }
}
