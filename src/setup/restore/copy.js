function requestValidateSpreadsheet (uuid, file_id) {
  if (!CacheService3.user().get(uuid)) {
    showSessionExpired();
    return;
  }

  showDialogMessage('Add-on restore', 'Verifying the spreadsheet...', 1);

  if (validateSpreadsheet_(uuid, file_id) !== 0) {
    showDialogSetupCopy(uuid, 'Sorry, it was not possible to verify the spreadsheet.');
    return;
  }

  if (SettingsCandidate.processSpreadsheet(uuid, file_id) !== 0) {
    showDialogSetupCopy(uuid, 'Sorry, it was not possible to verify the spreadsheet.');
    return;
  }

  CacheService3.user().put(uuid, true);
  showDialogSetupCopy(uuid, '');
}

function validateSpreadsheet_ (uuid, file_id) {
  if (!isUserOwner(file_id)) {
    showDialogSetupCopy(uuid, 'No spreadsheet with the given ID could be found, or you do not have permission to access it.');
    return;
  }

  const file = DriveApp.getFileById(file_id);
  if (file.getMimeType() !== MimeType.GOOGLE_SHEETS) {
    showDialogSetupCopy(uuid, 'Sorry, it was not possible to verify the spreadsheet.');
    return;
  }

  const spreadsheet = SpreadsheetApp.openById(file_id);
  const bs = new BsAuth(spreadsheet);

  if (!bs.verify()) {
    showDialogSetupCopy(uuid, 'Sorry, it was not possible to verify the spreadsheet.');
    return;
  }

  if (bs.getValueOf('admin_id') !== User2.getId()) {
    showDialogSetupCopy(uuid, 'No spreadsheet with the given ID could be found, or you do not have permission to access it.');
    return;
  }

  return 0;
}
