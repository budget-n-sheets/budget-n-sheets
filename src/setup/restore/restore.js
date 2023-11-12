/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

function showDialogPickerRestore (uuid) {
  new PickerService(uuid)
    .setCallbackFunction('requestValidateBackup_')
    .setFallbackFunction('showDialogSetupRestore')
    .showDialog('Select backup')
}

function requestValidateBackup_ (uuid, fileId) {
  const session = SessionService.withUser()
    .trySession(uuid)
    ?.getContext('addon-setup-service')

  if (!session) {
    showSessionExpired()
    return
  }

  showDialogMessage('Add-on restore', 'Verifying the backup...', true)
  let status = 0

  try {
    status = new BackupValidation(uuid, fileId).verify()
  } catch (err) {
    LogLog.error(err)
    status = 1
  }

  if (status === 0) return
  if (status === 100) status = 0

  session.setProperty('status', status)
  showDialogSetupRestore(uuid)
}

function continuedValidateBackup_ (uuid, password, param) {
  const session = SessionService.withUser()
    .trySession(uuid)
    ?.getContext('addon-setup-service')

  if (!session) {
    showSessionExpired()
    return
  }

  showDialogMessage('Add-on restore', 'Verifying the backup...', true)
  let status = 0

  try {
    status = new BackupValidation(uuid, param.fileId).continued(password)
  } catch (err) {
    LogLog.error(err)
    status = 3
  }

  session.setProperty('status', status)
  showDialogSetupRestore(uuid)
}

function unwrapBackup_ (uuid, file_id) {
  const backup = new BackupFile(file_id)

  if (backup.isLegacyFormat) {
    const parts = backup.data.split(':')

    const sha = Utilities2.computeDigest('SHA_1', parts[0], 'UTF_8')
    if (sha !== parts[1]) throw new Error("Hashes don't match.")

    const patched = BackupPatchService.patchThis(
      JSON.parse(
        Utilities2.base64DecodeWebSafe(parts[0], 'UTF_8')))
    if (patched == null) throw new Error('unwrapBackup_(): Unwrap failed.')

    return patched
  }

  const password = SessionService.withUser()
    .trySession(uuid)
    ?.getContext('addon-setup-service')
    ?.getContext([file_id, SpreadsheetApp2.getActive().getId()].join('/'))
    .getProperty('password')

  if (!password) {
    showSessionExpired()
    return
  }

  const decrypted = decryptBackup_(password, backup.data)
  const patched = BackupPatchService.patchThis(decrypted)
  if (patched == null) throw new Error('unwrapBackup_(): Unwrap failed.')

  return patched
}

function decryptBackup_ (password, backup) {
  try {
    const decoded = Utilities2.base64DecodeWebSafe(backup, 'UTF_8')
    const decrypted = sjcl.decrypt(password, decoded)
    return JSON.parse(decrypted)
  } catch (err) {
    LogLog.error(err)
  }
}
