/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SetupProgress {
  constructor () {
    this._config = {};
  }

  copyTemplate () {
    const spreadsheet = SpreadsheetApp3.getActive();
    const sheets = spreadsheet.getSheets();

    SpreadsheetService.copySheetsFromSource(
      Info.template.id,
      Info.template.sheets
    );

    sheets.forEach(sheet => spreadsheet.deleteSheet(sheet));
    SpreadsheetApp.flush();
    return this;
  }

  makeClean () {
    CacheService2.getDocumentCache().removeAll(CACHE_KEYS);
    PropertiesService2.getDocumentProperties().deleteAllProperties();

    Triggers.deleteAllUserTriggers();

    SpreadsheetService.deleteAllSheets();
    SpreadsheetService.removeAllMetadata();

    return this;
  }

  makeConfig (config) {
    const dec_p = Number(config.decimal_places);
    const dec_c = (dec_p > 0 ? '.' + '0'.repeat(dec_p) : '');
    const number_format = '#,##0' + dec_c + ';' + '(#,##0' + dec_c + ')';

    if (config.name_accounts.length > 5) {
      config.name_accounts = config.name_accounts.slice(0, 5);
      config.number_accounts = 5;
    }

    this._config = {
      setup_channel: config.setup_channel,

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
