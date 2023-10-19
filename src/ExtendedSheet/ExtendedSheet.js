/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class ExtendedSheet {
  constructor (name) {
    this._sheet = SpreadsheetApp2.getActive().getSheetByName(name);
    if (!this._sheet) throw new Error('Sheet not found.');
  }

  get sheet () {
    return this._sheet
  }

  removeCharts () {
    this.sheet
      .getCharts()
      .forEach(c => this.sheet.removeChart(c))
    return this
  }

  removeProtection () {
    const protections = this.sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET)
    for (const protection of protections) {
      if (protection.canEdit()) protection.remove()
    }
    return this
  }
}
