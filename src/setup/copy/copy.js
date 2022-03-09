function requestValidateSpreadsheet (uuid, fileId) {
  if (!CacheService3.user().get(uuid)) {
    showSessionExpired();
    return;
  }

  showDialogMessage('Add-on restore', 'Verifying the spreadsheet...', 1);
  let status = 0;

  try {
    SpreadsheetValidation.evalValid(fileId);
  } catch (err) {
    LogLog.error(err);
    status = 1;
  }

  if (status === 0) {
    try {
      SettingsCandidate.processSpreadsheet(uuid, fileId);
    } catch (err) {
      LogLog.error(err);
      status = 3;
    }
  }

  const address = Utilities2.computeDigest('SHA_1', ['setup_status', uuid, 'copy'].join(':'), 'UTF_8');
  CacheService3.document().put(address, status);

  if (status === 0) CacheService3.user().put(uuid, true);
  showDialogSetupCopy(uuid);
}
