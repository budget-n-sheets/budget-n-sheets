class BackupValidation {
  constructor (uuid, fileId) {
    this._uuid = uuid;
    this._fileId = fileId;

    this._file = null;
    this.isLegacy = false;
    this._data = null;
  }

  verifyLegacyBackup_ () {
    const parts = this._data.split(':');
    const sha = Utilities2.computeDigest('SHA_1', parts[0], 'UTF_8');

    if (sha !== parts[1]) throw 1;

    const string = Utilities2.base64DecodeWebSafe(parts[0], 'UTF_8');
    SettingsCandidate.processBackup(this._uuid, this._file, JSON.parse(string));
  }

  verifyMetadata_ () {
    if (!isUserOwner(this._fileId)) throw 2;

    this._file = DriveApp.getFileById(this._fileId);
    this._data = this._file.getBlob().getDataAsString();

    if (/:[0-9a-fA-F]+$/.test(this._data)) this.isLegacy = true;
  }

  verify () {
    this.verifyMetadata_();

    if (this.isLegacy) {
      this.verifyLegacyBackup_();
      return 100;
    }

    const htmlOutput = HtmlService2.createTemplateFromFile('setup/restore/htmlEnterPassword')
      .assignReservedHref()
      .setScriptletValues({
        uuid: this._uuid,
        file_id: this._fileId
      })
      .evaluate()
      .setWidth(281)
      .setHeight(127);

    SpreadsheetApp2.getUi().showModalDialog(htmlOutput, 'Enter password');
    return 0;
  }

  continued (password) {
    if (!isUserOwner(this._fileId)) throw 2;

    const file = DriveApp.getFileById(this._fileId);
    const data = file.getBlob().getDataAsString();

    const decrypted = decryptBackup_(password, data);
    const patched = BackupPatchService.patchThis(decrypted);
    if (patched == null) throw 3;

    SettingsCandidate.processBackup(this._uuid, file, patched);

    const address = Utilities2.computeDigest('SHA_1', this._uuid + file.getId() + SpreadsheetApp2.getActiveSpreadsheet().getId(), 'UTF_8');
    CacheService3.user().put(address, password, 180);
    return 0;
  }
}
