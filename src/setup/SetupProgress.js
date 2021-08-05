class SetupProgress {
  constructor (config) {
    const dec_p = Number(config.decimal_places);
    const dec_c = (dec_p > 0 ? '.' + '0'.repeat(dec_p) : '');
    const number_format = '#,##0' + dec_c + ';' + '(#,##0' + dec_c + ')';

    CachedAccess.update('setup_settings', {
      date: {
        time: DATE_NOW.getTime(),
        yyyy: DATE_NOW.getFullYear(),
        mm: DATE_NOW.getMonth()
      },

      list_acc: config.name_accounts,
      number_accounts: Number(config.number_accounts),

      financial_year: Number(config.financial_year),
      init_month: Number(config.initial_month),

      decimal_places: dec_p,
      decimal_separator: true,
      number_format: number_format
    });
  }

  makeClean () {
    CacheService3.document().removeAll(CACHE_KEYS);
    PropertiesService3.document().deleteAllProperties();

    Triggers.deleteAllUserTriggers();

    SpreadsheetService.deleteAllSheets();
    SpreadsheetService.removeAllMetadata();
  }
}
