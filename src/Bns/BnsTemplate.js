class BnsTemplate {
  static isAvailable () {
    try {
      SpreadsheetApp.openById(Info.template.id);
    } catch (err) {
      console.error('BnS template is not available!');
      return false;
    }
    return true;
  }

  static isLocked () {
    return !!PropertiesService2.getDocumentProperties().getProperty('lock_spreadsheet');
  }

  static isUpToDate () {
    const v0 = ClassVersion.getValueOf('template');
    const vA = Info.template.version;
    return PatchThisUtils.isLatestVersion(v0, vA);
  }
}
