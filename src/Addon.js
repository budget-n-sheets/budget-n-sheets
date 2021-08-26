class Addon {
  static isUpToDate () {
    return AppsScript.isUpToDate() && BnsTemplate.isUpToDate();
  }
}
