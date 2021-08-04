class SetupConfig {
  static configNew_ (config) {
    config.spreadsheet_name = config.spreadsheet_name.trim();
    if (config.spreadsheet_name === '') throw new Error('Invalid spreadsheet name.');

    for (let i = 0; i < config.name_accounts.length; i++) {
      config.name_accounts = config.name_accounts[i].trim();
      if (config.name_accounts === '') throw new Error('Invalid account name.');
    }

    return config;
  }

  static makeConfig (payload) {
    switch (payload.process) {
      case 'new':
        return this.configNew_(payload.config);
    }
  }
}
