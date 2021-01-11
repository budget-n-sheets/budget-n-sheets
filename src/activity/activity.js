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

function switchActivity_ (select, param) {
  const lock = LockService.getDocumentLock();
  try {
    lock.waitLock(200);
  } catch (err) {
    return 1;
  }

  let mm;

  SpreadsheetApp.flush();

  if (select === 'suspend') {
    const date = getSpreadsheetDate.call(DATE_NOW);
    const yyyy = date.getFullYear();

    const financial_year = getConstProperties_('financial_year');

    if (yyyy < financial_year) {
      return;
    } else if (yyyy === financial_year) {
      if (date.getMonth() < 3) return;
      mm = date.getMonth() - 3;
    } else {
      mm = 11;
    }

    suspendActivity_(0, mm);
  } else if (select === 'resume') {
    resumeActivity_(param);
  }

  lock.releaseLock();
}
