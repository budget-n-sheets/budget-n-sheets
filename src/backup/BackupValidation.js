class BackupValidation {
  constructor (uuid, fileId) {
    this._uuid = uuid;
    this._backup = new BackupFile(fileId);
  }

  verifyLegacyBackup_ () {
    const parts = this._backup.data.split(':');
    const sha = Utilities2.computeDigest('SHA_1', parts[0], 'UTF_8');

    if (sha !== parts[1]) throw new Error('Validation failed.');

    const patched = BackupPatchService.patchThis(
      JSON.parse(
        Utilities2.base64DecodeWebSafe(parts[0], 'UTF_8')
      )
    );
    if (patched == null) throw new Error('Patch failed.');

    SettingsCandidate.processBackup(this._uuid, this._backup, patched);
  }

  verify () {
    if (this._backup.metadata.isLegacyFormat) {
      this.verifyLegacyBackup_();
      return 100;
    }

    const htmlOutput = HtmlService2.createTemplateFromFile('setup/restore/htmlEnterPassword')
      .assignReservedHref()
      .setScriptletValues({
        uuid: this._uuid,
        file_id: this._backup.getId()
      })
      .evaluate()
      .setWidth(281)
      .setHeight(127);

    SpreadsheetApp2.getUi().showModalDialog(htmlOutput, 'Enter password');
    return 0;
  }

  continued (password) {
    const decrypted = decryptBackup_(password, this._backup.data);
    const patched = BackupPatchService.patchThis(decrypted);
    if (patched == null) throw new Error('Update failed.');

    SettingsCandidate.processBackup(this._uuid, this._backup, patched);
    SessionService.getSession(this._uuid)
      .createContext(
        [this._backup.getId(), SpreadsheetApp2.getActiveSpreadsheet().getId()],
        password,
        180);

    return 0;
  }
}
