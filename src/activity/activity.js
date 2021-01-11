function toolResumeActivity_ () {
  console.info('menu/More/Resume month');

  if (!isInstalled_()) return;
  if (onlineUpdate_()) return;

  const name = SpreadsheetApp.getActiveSheet().getSheetName();
  const mm = MONTH_NAME.short.indexOf(name);

  if (mm === -1) {
    SpreadsheetApp.getUi().alert(
      "Can't change activity",
      'Select a month to resume the activity.',
      SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  const r = switchActivity_(select, mm);

  if (r === 1) {
    SpreadsheetApp.getActiveSheet().toast(
      'The add-on is busy. Try again in a moment.',
      'Budget n Sheets');
  }
}

function switchActivity_ (select, param1, param2) {
  const lock = LockService.getDocumentLock();
  try {
    lock.waitLock(200);
  } catch (err) {
    return 1;
  }

  switch (select) {
    case 'resume':
      resumeActivity_(param1);
      break;
    case 'suspend':
      suspendActivity_(param1, param2);
      break;

    default:
      throw new Error('switchActivity_(): Invalid case. ' + select);
  }

  lock.releaseLock();
}
