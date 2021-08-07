class SetupProgress {
  constructor () {
  }

  copyTemplate () {
    SpreadsheetService.copySheetsFromSource(
      APPS_SCRIPT_GLOBAL.template_id,
      APPS_SCRIPT_GLOBAL.template_sheets
    );

    SpreadsheetApp.flush();
    return this;
  }

  makeClean () {
    CacheService3.document().removeAll(CACHE_KEYS);
    PropertiesService3.document().deleteAllProperties();

    Triggers.deleteAllUserTriggers();

    SpreadsheetService.deleteAllSheets();
    SpreadsheetService.removeAllMetadata();

    return this;
  }

  makeConfig (config) {
    const dec_p = Number(config.decimal_places);
    const dec_c = (dec_p > 0 ? '.' + '0'.repeat(dec_p) : '');
    const number_format = '#,##0' + dec_c + ';' + '(#,##0' + dec_c + ')';

    this._config = {
      name_accounts: config.name_accounts,
      number_accounts: Number(config.number_accounts),

      financial_year: Number(config.financial_year),
      initial_month: Number(config.initial_month),

      decimal_places: dec_p,
      decimal_separator: true,
      number_format: number_format
    };

    return this;
  }

  makeInstall () {
    new SetupParts(this._config).run();
    return this;
  }
}
