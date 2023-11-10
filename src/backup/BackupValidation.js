/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class BackupValidation {
  constructor (uuid, fileId) {
    this._uuid = uuid
    this._backup = new BackupFile(fileId)
  }

  verifyLegacyBackup_ () {
    const parts = this._backup.data.split(':')
    const sha = Utilities2.computeDigest('SHA_1', parts[0], 'UTF_8')

    if (sha !== parts[1]) throw new Error('Validation failed.')

    const patched = BackupPatchService.patchThis(
      JSON.parse(
        Utilities2.base64DecodeWebSafe(parts[0], 'UTF_8')
      )
    )
    if (patched == null) throw new Error('Patch failed.')

    SettingsCandidate.processBackup(this._uuid, this._backup, patched)
  }

  verify () {
    if (this._backup.isLegacyFormat) {
      this.verifyLegacyBackup_()
      return 100
    }

    new ShadowService(this._uuid)
      .setParam('fileId', this._backup.getId())
      .setCallbackFunction('continuedValidateBackup_')
      .showDialog()
    return 0
  }

  continued (password) {
    const decrypted = decryptBackup_(password, this._backup.data)
    const patched = BackupPatchService.patchThis(decrypted)
    if (patched == null) throw new Error('Update failed.')

    SettingsCandidate.processBackup(this._uuid, this._backup, patched)
    SessionService.withUser()
      .getSession(this._uuid)
      ?.getContext('addon-setup-service')
      .getContext(
        [this._backup.getId(), SpreadsheetApp2.getActive().getId()].join('/'),
        180)
      .setProperty('password', password)

    return 0
  }
}
