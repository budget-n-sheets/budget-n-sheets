class SetupService {
  static checkRequirements () {
    if (!BnsTemplate.isAvailable()) return 1;
    if (Addon.isInstalled()) return 2;
    if (BnsTemplate.isLocked()) return 3;

    const spreadsheet = SpreadsheetApp2.getActive().spreadsheet;

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
    CacheService2.getUserCache().put(uuid, true);
    return uuid;
  }
}
