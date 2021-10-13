function requestValidateBackup (uuid, file_id) {
  if (!CacheService3.user().get(uuid)) {
    showSessionExpired();
    return;
  }

  if (!isUserOwner(file_id)) {
    showDialogSetupRestore(uuid, 'No file with the given ID could be found, or you do not have permission to access it.');
    return;
  }

  const file = DriveApp.getFileById(file_id);
  const data = file.getBlob().getDataAsString();

  if (/:[0-9a-fA-F]+$/.test(data)) {
    processLegacyBackup_(uuid, { file: file, id: file_id, name: file.getName() }, data);
    return;
  }

  const scriptlet = { file_id: file_id, uuid: uuid };
  const htmlOutput = HtmlService2.createTemplateFromFile('setup/restore/htmlEnterPassword')
    .assignReservedHref()
    .setScriptletValues(scriptlet)
    .evaluate()
    .setWidth(281)
    .setHeight(127);

  SpreadsheetApp2.getUi().showModalDialog(htmlOutput, 'Enter password');
}

function processLegacyBackup_ (uuid, file, data) {
  const parts = data.split(':');
  const sha = Utilities2.computeDigest('SHA_1', parts[0], 'UTF_8');

  if (sha !== parts[1]) {
    showDialogSetupRestore(uuid, 'The file is either not a supported file type or the file is corrupted.');
    return;
  }

  const string = Utilities2.base64DecodeWebSafe(parts[0], 'UTF_8');
  if (SettingsCandidate.processBackup(uuid, file, JSON.parse(string)) !== 0) {
    showDialogSetupRestore(uuid, 'Sorry, something went wrong. Try again in a moment.');
    return;
  }

  CacheService3.user().put(uuid, true);
  showDialogSetupRestore(uuid, '');
}

function requestDevelopBackup (uuid, file_id, password) {
  if (!CacheService3.user().get(uuid)) {
    showSessionExpired();
    return;
  }

  showDialogMessage('Add-on restore', 'Verifying backup...', 1);

  if (!isUserOwner(file_id)) {
    showDialogSetupRestore(uuid, 'No file with the given ID could be found, or you do not have permission to access it.');
    return;
  }

  const file = DriveApp.getFileById(file_id);
  const data = file.getBlob().getDataAsString();
  const decrypted = decryptBackup_(password, data);

  if (decrypted == null) {
    showDialogSetupRestore(uuid, 'The password is incorrect or the file is corrupted.');
    return;
  }

  const address = Utilities2.computeDigest(
    'SHA_1',
    uuid + file.getId() + SpreadsheetApp2.getActiveSpreadsheet().getId(),
    'UTF_8');
  CacheService3.user().put(address, password, 180);

  if (SettingsCandidate.processBackup(uuid, { file: file, id: file_id, name: file.getName() }, decrypted) !== 0) {
    showDialogSetupRestore(uuid, 'Sorry, something went wrong. Try again in a moment.');
    return;
  }

  CacheService3.user().put(uuid, true);
  showDialogSetupRestore(uuid, '');
}

function unwrapBackup_ (uuid, blob, file_id) {
  const data = blob.getDataAsString();

  if (/:[0-9a-fA-F]+$/.test(data)) {
    const parts = data.split(':');

    const sha = Utilities2.computeDigest('SHA_1', parts[0], 'UTF_8');
    if (sha !== parts[1]) throw new Error("Hashes don't match.");

    return parts[0];
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
  if (decrypted == null) throw new Error('decryptBackup_(): Decryption failed.');

  return decrypted;
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
