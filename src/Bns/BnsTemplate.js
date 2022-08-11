class BnsTemplate {
  static isAvailable () {
    const b = SpreadsheetService.isSpreadsheetAvailable(Info.template.id);
    if (!b) throw new Error('Spreadsheet template is not available!');
    return b;
  }

  static isLocked () {
    return !!PropertiesService3.document().getProperty('lock_spreadsheet');
  }

  static isUpToDate () {
    const v0 = ClassVersion.getValueOf('template');
    const vA = Info.template.version;
    return PatchThisUtils.isLatestVersion(v0, vA);
  }
}
