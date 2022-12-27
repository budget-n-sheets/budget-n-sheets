/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SpreadsheetValidation {
  static evalValid (fileId) {
    const spreadsheet = new DriveFile(fileId).asSpreadsheet();
    const bs = new BsAuth(spreadsheet);

    if (!bs.hasSig()) throw new Error('Validation failed.');
    if (!bs.verify()) throw new Error('Validation failed.');
    if (bs.getValueOf('admin_id') !== User2.getId()) throw new Error('Permission denied.');
  }
}
