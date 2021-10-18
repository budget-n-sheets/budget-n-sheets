class SetupConfig {
  static configCopy_ (uuid, config) {
    const candidate = PropertiesService3.document().getProperty('settings_candidate');
    if (candidate.uuid !== uuid) throw new Error('UUID does not match.');
    if (candidate.protocol !== 'copy') throw new Error('Protocol does not match.');

    config.file_id = candidate.source.file_id;

    return config;
  }

  static configRestore_ (uuid, config) {
    const candidate = PropertiesService3.document().getProperty('settings_candidate');
    if (candidate.uuid !== uuid) throw new Error('UUID does not match.');
    if (candidate.protocol !== 'restore') throw new Error('Protocol does not match.');

    const blob = DriveApp.getFileById(candidate.source.file_id).getBlob();
    config.backup = unwrapBackup_(uuid, blob, candidate.source.file_id);
    if (config.backup == null) return;

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
        config.name_accounts = config.name_accounts.filter(e => e.require === 'new');
        break;
      case 'restore':
        config = this.configRestore_(uuid, payload.config);
        break;

      default:
        throw new Error('SetupConfig: digestConfig(): Switch case is default.');
    }

    config.spreadsheet_name = config.spreadsheet_name.trim();
    if (config.spreadsheet_name === '') throw new Error('Invalid spreadsheet name.');

    config.name_accounts.forEach((e, i, a) => {
      a[i].name = e.name.trim();
      if (a[i].name === '') throw new Error('Invalid account name.');
    });
    config.name_accounts.sort((a, b) => a.index - b.index);

    config.number_accounts = config.name_accounts.length;
    if (config.number_accounts < 1) throw new Error('Invalid number of accounts.');

    return config;
  }
}
