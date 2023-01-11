/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

function showDialogPickerCopy (uuid) {
  new PickerService(uuid)
    .setCallbackFunction('requestValidateSpreadsheet_')
    .setFallbackFunction('showDialogSetupCopy')
    .showDialog('copy', 'Select spreadsheet');
}

function requestValidateSpreadsheet_ (uuid, fileId) {
  let session;
  try {
    session = SessionService.getSession(uuid);
  } catch (err) {
    LogLog.error(err);
    showSessionExpired();
    return;
  }

  showDialogMessage('Add-on restore', 'Verifying the spreadsheet...', true);
  let status = 0;

  try {
    if (!Stamp.verify(fileId)) throw new Error('Verification failed.')
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

  if (status === 0) CacheService2.getUserCache().put(uuid, true);
  showDialogSetupCopy(uuid);
}
