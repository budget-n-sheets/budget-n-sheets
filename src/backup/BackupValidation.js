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

    new ShadowService(this._uuid)
      .setParam('fileId', this._backup.getId())
      .setCallbackFunction('continuedValidateBackup_')
      .showDialog();
    return 0;
  }

  continued (password) {
    const decrypted = decryptBackup_(password, this._backup.data);
    const patched = BackupPatchService.patchThis(decrypted);
    if (patched == null) throw new Error('Update failed.');

    SettingsCandidate.processBackup(this._uuid, this._backup, patched);

    const address = Utilities2.computeDigest(
      'SHA_1',
      this._uuid + this._backup.getId() + SpreadsheetApp2.getActiveSpreadsheet().getId(),
      'UTF_8');
    CacheService3.user().put(address, password, 180);
    return 0;
  }
}
