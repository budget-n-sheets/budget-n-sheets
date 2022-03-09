function showDialogPickerRestore (uuid) {
  new PickerService(uuid)
    .setCallbackFunction('requestValidateBackup_')
    .setFallbackFunction('showDialogSetupRestore')
    .showDialog('restore', 'Select backup');
}

function requestValidateBackup_ (uuid, fileId) {
  let session;
  try {
    session = SessionService.getSession(uuid);
  } catch (err) {
    LogLog.error(err);
    showSessionExpired();
    return;
  }

  showDialogMessage('Add-on restore', 'Verifying the backup...', 1);
  let status = 0;

  try {
    status = new BackupValidation(uuid, fileId).verify();
  } catch (err) {
    LogLog.error(err);
    status = 1;
  }

  if (status === 0) return;
  if (status === 100) status = 0;

  session.createContext(['setup', 'restore'], status);
  showDialogSetupRestore(uuid);
}

function continuedValidateBackup_ (uuid, password, param) {
  let session;
  try {
    session = SessionService.getSession(uuid);
  } catch (err) {
    LogLog.error(err);
    showSessionExpired();
    return;
  }

  showDialogMessage('Add-on restore', 'Verifying backup...', 1);
  let status = 0;

  try {
    status = new BackupValidation(uuid, param.fileId).continued(password);
  } catch (err) {
    LogLog.error(err);
    status = 3;
  }

  session.createContext(['setup', 'restore'], status);
  showDialogSetupRestore(uuid);
}

function unwrapBackup_ (uuid, file_id) {
  const backup = new BackupFile(file_id);

  if (backup.metadata.isLegacyFormat) {
    const parts = backup.data.split(':');

    const sha = Utilities2.computeDigest('SHA_1', parts[0], 'UTF_8');
    if (sha !== parts[1]) throw new Error("Hashes don't match.");

    const patched = BackupPatchService.patchThis(
      JSON.parse(
        Utilities2.base64DecodeWebSafe(parts[0], 'UTF_8')
      )
    );
    if (patched == null) throw new Error('unwrapBackup_(): Unwrap failed.');

    return patched;
  }


  let password = '';
  try {
    password = SessionService.getSession(uuid).retrieveContext([file_id, SpreadsheetApp2.getActiveSpreadsheet().getId()]);
  } catch (err) {
    LogLog.error(err);
    showSessionExpired();
    return;
  }

  const decrypted = decryptBackup_(password, backup.data);
  const patched = BackupPatchService.patchThis(decrypted);
  if (patched == null) throw new Error('unwrapBackup_(): Unwrap failed.');

  return patched;
}

function decryptBackup_ (password, backup) {
  try {
    const decoded = Utilities2.base64DecodeWebSafe(backup, 'UTF_8');
    const decrypted = sjcl.decrypt(password, decoded);
    return JSON.parse(decrypted);
  } catch (err) {
    LogLog.error(err);
  }
}
