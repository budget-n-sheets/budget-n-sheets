function requestValidateBackup (uuid, fileId) {
  if (!CacheService3.user().get(uuid)) {
    showSessionExpired();
    return;
  }

  showDialogMessage('Add-on restore', 'Verifying the backup...', 1);
  let status = 0;

  try {
    status = new BackupValidation(uuid, fileId).verify();
  } catch (err) {
    LogLog.error(err);
    status = typeof err === 'number' ? err : 9;
  }

  if (status === 0) return;
  if (status === 100) {
    CacheService3.user().put(uuid, true);
    status = 0;
  }

  const address = Utilities2.computeDigest('SHA_1', ['setup_status', uuid, 'restore'].join(':'), 'UTF_8');
  CacheService3.document().put(address, status);
  showDialogSetupRestore(uuid);
}

function continuedValidateBackup (uuid, fileId, password) {
  if (!CacheService3.user().get(uuid)) {
    showSessionExpired();
    return;
  }

  showDialogMessage('Add-on restore', 'Verifying backup...', 1);
  let status = 0;

  try {
    status = new BackupValidation(uuid, fileId).continued(password);
  } catch (err) {
    LogLog.error(err);
    status = typeof err === 'number' ? err : 9;
  }

  const address = Utilities2.computeDigest('SHA_1', ['setup_status', uuid, 'restore'].join(':'), 'UTF_8');
  CacheService3.document().put(address, status);

  if (status === 0) CacheService3.user().put(uuid, true);
  showDialogSetupRestore(uuid);
}

function unwrapBackup_ (uuid, blob, file_id) {
  const data = blob.getDataAsString();

  if (/:[0-9a-fA-F]+$/.test(data)) {
    const parts = data.split(':');

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

  const address = Utilities2.computeDigest(
    'SHA_1',
    uuid + file_id + SpreadsheetApp2.getActiveSpreadsheet().getId(),
    'UTF_8');
  const password = CacheService3.user().get(address);
  CacheService3.user().remove(address);

  if (password == null) {
    showSessionExpired();
    return;
  }

  const decrypted = decryptBackup_(password, data);
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
