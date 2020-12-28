function toolShowSheets_ () {
  pagesView_('show');
}

function toolHideSheets_ () {
  pagesView_('hide');
}

function pagesView_ (select, a) {
  const lock = LockService.getDocumentLock();
  try {
    lock.waitLock(200);
  } catch (err) {
    SpreadsheetApp.getUi().alert(
      'Add-on is busy',
      'The add-on is busy. Try again in a moment.',
      SpreadsheetApp.getUi().ButtonSet.OK);

    ConsoleLog.warn(err);
    return;
  }

  switch (select) {
    case 'show':
      showSheets_();
      break;
    case 'hide':
      hideSheets_(a);
      break;

    default:
      ConsoleLog.error('pagesView_(): Switch case is default.', select);
      break;
  }

  lock.releaseLock();
}

function hideSheets_ (a) {
  let sheet;
  let mm, i;

  if (a) {
    mm = getSpreadsheetDate.call(DATE_NOW).getMonth();
  } else {
    sheet = SpreadsheetApp.getActiveSheet();
    mm = MONTH_NAME.short.indexOf(sheet.getName());
    if (mm === -1) {
      SpreadsheetApp.getUi().alert(
        "Can't collapse pages view",
        'Select a month to collapse pages view.',
        SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
  }

  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  const delta = getMonthDelta(mm);

  for (i = 0; i < 12; i++) {
    sheet = spreadsheet.getSheetByName(MONTH_NAME.short[i]);
    if (sheet) {
      if (i < mm + delta[0] || i > mm + delta[1]) sheet.hideSheet();
      else sheet.showSheet();
    }
  }
}

function showSheets_ () {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  let sheet, i;

  for (i = 0; i < 12; i++) {
    sheet = spreadsheet.getSheetByName(MONTH_NAME.short[i]);
    if (sheet) sheet.showSheet();
  }
}
