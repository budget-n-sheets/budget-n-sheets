class SpreadsheetValidation {
  constructor (uuid, fileId) {
    this._uuid = uuid;
    this._fileId = fileId;
  }

  verifyMetadata_ () {
    if (!isUserOwner(this._fileId)) throw 2;

    const file = DriveApp.getFileById(this._fileId);
    if (file.getMimeType() !== MimeType.GOOGLE_SHEETS) throw 1;

    const spreadsheet = SpreadsheetApp.openById(this._fileId);
    const bs = new BsAuth(spreadsheet);

    if (!bs.verify()) throw 1;
    if (bs.getValueOf('admin_id') !== User2.getId()) throw 2;
  }

  verify () {
    this.verifyMetadata_();
    SettingsCandidate.processSpreadsheet(this._uuid, this._fileId);
  }
}
