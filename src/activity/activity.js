function toolResumeActivity_ () {
  if (!AppsScript.isInstalled()) return;
  if (UpdateService.checkAndUpdate(true)) return;

  const name = SpreadsheetApp.getActiveSheet().getSheetName();
  const mm = Consts.month_name.short.indexOf(name);

  let mm0 = mm;
  let mm1 = mm;

  if (mm === -1) {
    if (name !== 'Summary') {
      SpreadsheetApp2.getUi().alert(
        "Can't change activity",
        'Select tab Summary or a month to resume the activity.',
        SpreadsheetApp2.getUi().ButtonSet.OK);
      return;
    }

    mm0 = 0;
    mm1 = 11;
  }

  const r = switchActivity_('resume', mm0, mm1);

  if (r === 1) {
    SpreadsheetApp.getActiveSheet().toast(
      'The add-on is busy. Try again in a moment.',
      'Budget n Sheets');
  }
}

function switchActivity_ (select, param1, param2) {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(200)) return 1;

  switch (select) {
    case 'resume':
      resumeActivity_(param1, param2);
      break;
    case 'suspend':
      suspendActivity_(param1, param2);
      break;

    default:
      throw new Error('switchActivity_(): Invalid case. ' + select);
  }

  lock.releaseLock();
}
