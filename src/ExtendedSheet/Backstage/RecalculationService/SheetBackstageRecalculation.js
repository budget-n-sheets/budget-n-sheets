class SheetBackstageRecalculation extends SheetBackstage {
  constructor () {
    super();
    this.load = SettingsSpreadsheet.get('optimize_load');
  }

  get _h () {
    return this.specs.table.height;
  }

  get _w () {
    return this.specs.table.width;
  }
}
