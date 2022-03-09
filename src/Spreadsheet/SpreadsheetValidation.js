class SpreadsheetValidation {
  static evalValid (fileId) {
    const spreadsheet = new DriveFile(fileId).asSpreadsheet();
    const bs = new BsAuth(spreadsheet);

    if (!bs.hasSig()) throw new Error('Validation failed.');
    if (!bs.verify()) throw new Error('Validation failed.');
    if (bs.getValueOf('admin_id') !== User2.getId()) throw new Error('Permission denied.');
  }
}
