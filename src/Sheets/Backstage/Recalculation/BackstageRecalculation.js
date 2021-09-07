class BackstageRecalculation extends SheetBackstage {
  constructor () {
    super();
    this.load = SettingsSpreadsheet.getValueOf('optimize_load');
  }

  get _h () {
    return this.specs.table.height;
  }

  get _w () {
    return this.specs.table.width;
  }
}
