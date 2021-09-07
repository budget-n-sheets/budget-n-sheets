class BackstageRecalculation extends SheetBackstage {
  constructor () {
    super();
    this.load = SettingsSpreadsheet.getValueOf('optimize_load');
  }
}
