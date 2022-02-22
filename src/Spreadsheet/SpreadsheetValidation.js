class SpreadsheetValidation {
  static evalValid (fileId) {
    const spreadsheet = new DriveFile(fileId).asSpreadsheet();
    const bs = new BsAuth(spreadsheet);

    if (!bs.hasSig()) throw 1;
    if (!bs.verify()) throw 1;
    if (bs.getValueOf('admin_id') !== User2.getId()) throw 2;
  }
}
