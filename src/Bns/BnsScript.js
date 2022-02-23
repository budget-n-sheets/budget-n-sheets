class BnsScript {
  static isUpToDate () {
    const v0 = ClassVersion.getValueOf('script');
    const vA = Info.apps_script.version;
    return SemVerUtils.hasMinimumVersion(v0, vA);
  }
}
