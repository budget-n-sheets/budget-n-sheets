class SetupProgress extends SetupService {
  constructor () {
    super();
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

  makeInstall (config) {
    const setupParts = new SetupParts();

    setupParts.makeConfig(config).install();

    return this;
  }
}
