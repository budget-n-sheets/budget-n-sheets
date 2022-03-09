function showDialogPickerCopy (uuid) {
  new PickerService(uuid)
    .setCallbackFunction('requestValidateSpreadsheet')
    .setFallbackFunction('showDialogSetupCopy')
    .showDialog('copy', 'Select spreadsheet');
}

function requestValidateSpreadsheet (uuid, fileId) {
  let session;
  try {
    session = SessionService.getSession(uuid);
  } catch (err) {
    LogLog.error(err);
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

  session.createContext(['setup', 'copy'], status);

  if (status === 0) CacheService3.user().put(uuid, true);
  showDialogSetupCopy(uuid);
}
