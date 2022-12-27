/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class RapidAccessSpreadsheet {
  constructor (spreadsheet) {
    this._spreadsheet = spreadsheet;
  }

  get self () {
    return this._spreadsheet._self;
  }

  metadata () {
    return this._spreadsheet.metadata ||
          (this._spreadsheet.metadata = new Metadata());
  }

  sheets () {
    return this._spreadsheet.sheets;
  }
}
