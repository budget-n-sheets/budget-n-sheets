class SpreadsheetValidation {
  static evalValidation (fileId) {
    if (!isUserOwner(fileId)) throw 2;

    const file = DriveApp.getFileById(fileId);
    if (file.getMimeType() !== MimeType.GOOGLE_SHEETS) throw 1;

    const spreadsheet = SpreadsheetApp.openById(fileId);
    const bs = new BsAuth(spreadsheet);

    if (!bs.verify()) throw 1;
    if (bs.getValueOf('admin_id') !== User2.getId()) throw 2;
  }
}
