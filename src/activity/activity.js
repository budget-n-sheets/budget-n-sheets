function toolSuspendActivity_ () {
  switchActivityUi_('suspend');
}

function toolResumeActivity_ () {
  switchActivityUi_('resume');
}

function switchActivityUi_ (select) {
  if (!isInstalled_()) return;
  if (onlineUpdate_()) return;

  const r = switchActivity_(select);

  if (r === 1) {
    SpreadsheetApp.getActiveSheet().toast(
      'The add-on is busy. Try again in a moment.',
      'Budget n Sheets');
  } else if (r === 2) {
    SpreadsheetApp.getUi().alert(
      "Can't change activity",
      'Select a month to change the activity.',
      SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function switchActivity_ (select) {
  const lock = LockService.getDocumentLock();
  try {
    lock.waitLock(200);
  } catch (err) {
    return 1;
  }

  var mm;

  SpreadsheetApp.flush();

  if (select === 'suspend') {
    const date = getSpreadsheetDate.call(DATE_NOW);
    const yyyy = date.getFullYear();

    const financial_year = getConstProperties_('financial_year');

    if (yyyy < financial_year) {
      return;
    } else if (yyyy === financial_year) {
      if (date.getMonth() < 3) return;
      mm = date.getMonth() - 3 + 1;
    } else {
      mm = 12;
    }

    suspendActivity_(mm);
  } else if (select === 'resume') {
    mm = MN_SHORT.indexOf(SpreadsheetApp.getActiveSheet().getSheetName());
    if (mm === -1) return 2;

    resumeActivity_(mm);
  }

  lock.releaseLock();
}
