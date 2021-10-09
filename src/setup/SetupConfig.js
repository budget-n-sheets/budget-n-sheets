class SetupConfig {
  static configCopy_ (uuid, config) {
    const candidate = PropertiesService3.document().getProperty('settings_candidate');
    if (candidate.uuid !== uuid) throw new Error('UUID does not match.');
    if (candidate.protocol !== 'copy') throw new Error('Protocol does not match.');

    config.file_id = candidate.source.file_id;
    config.name_accounts.forEach((e, i) => e.newIndex = i);

    return config;
  }

  static configRestore_ (uuid, config) {
    const candidate = PropertiesService3.document().getProperty('settings_candidate');
    if (candidate.uuid !== uuid) throw new Error('UUID does not match.');
    if (candidate.protocol !== 'restore') throw new Error('Protocol does not match.');

    const blob = DriveApp.getFileById(candidate.source.file_id).getBlob();
    config.backup = unwrapBackup_(uuid, blob, candidate.source.file_id);
    if (config.backup == null) return;

    config.name_accounts.forEach((e, i) => e.newIndex = i);

    return config;
  }

  static digestConfig (uuid, payload) {
    let config = {};

    switch (payload.protocol) {
      case 'copy':
        config = this.configCopy_(uuid, payload.config);
        break;
      case 'new':
        config = Utils.deepCopy(payload.config);
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
      config.name_accounts[i].name = config.name_accounts[i].name.trim();
      if (config.name_accounts[i].name === '') throw new Error('Invalid account name.');
    }

    config.number_accounts = config.name_accounts.length;

    return config;
  }
}
