class SetupService {
  contructor () {
  }

  static checkRequirements () {
    if (!AppsScript.isTemplateAvailable()) return 1;
    if (AppsScript.isInstalled()) return 2;
    if (AppsScript.isLocked()) return 3;

    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();

    const owner = spreadsheet.getOwner();
    if (owner) {
      const user = Session.getEffectiveUser().getEmail();
      if (owner.getEmail() !== user) return 4;
    }

    if (spreadsheet.getFormUrl()) return 5;

    return 0;
  }

  static getUuid () {
    const uuid = Utilities.getUuid();
    CacheService3.user().put(uuid, true);
    return uuid;
  }
}
