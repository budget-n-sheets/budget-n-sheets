class BnsTemplate {
  static isUpToDate () {
    const v0 = ClassVersion.getValueOf('template');
    const vA = Info.template.version;
    return SemVerUtils.hasMinimumVersion(v0, vA);
  }
}
