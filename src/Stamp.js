/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class Stamp {
  static seal () {
    if (!Addon.isInstalled()) throw new Error('Add-on is not installed.')
    const spreadsheet = SpreadsheetApp2.getActive()
    spreadsheet.getMetadata()
      .set('stamp', {
        date: new Date().getTime(),
        spreadsheet_id: spreadsheet.getId()
      });
  }

  static verify (id = '') {
    return id === SpreadsheetApp2.openById(id)
      .getMetadata()
      .get('stamp')
      .spreadsheet_id
  }
}
