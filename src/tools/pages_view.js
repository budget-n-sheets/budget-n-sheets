/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

function toolShowSheets_ () {
  pagesView_('show')
}

function toolHideSheets_ () {
  pagesView_('hide')
}

function pagesView_ (select, a) {
  const lock = LockService.getDocumentLock()
  if (!lock.tryLock(200)) {
    SpreadsheetApp2.getUi().alert(
      'Add-on is busy',
      'The add-on is busy. Try again in a moment.',
      SpreadsheetApp2.getUi().ButtonSet.OK)
    return
  }

  switch (select) {
    case 'show':
      showSheets_()
      break
    case 'hide':
      hideSheets_(a)
      break

    default:
      console.error('pagesView_(): Switch case is default.', select)
      break
  }

  lock.releaseLock()
}

function hideSheets_ (a) {
  let sheet
  let mm

  if (a) {
    mm = LocaleUtils.getDate().getMonth()
  } else {
    sheet = SpreadsheetApp.getActiveSheet()
    mm = Consts.month_name.short.indexOf(sheet.getName())
    if (mm === -1) {
      SpreadsheetApp2.getUi().alert(
        "Can't collapse pages view",
        'Select a month to collapse pages view.',
        SpreadsheetApp2.getUi().ButtonSet.OK)
      return
    }
  }

  const spreadsheet = SpreadsheetApp2.getActive().spreadsheet
  const delta = Utils.getMonthDelta(mm)

  for (let i = 0; i < 12; i++) {
    sheet = spreadsheet.getSheetByName(Consts.month_name.short[i])
    if (sheet) {
      if (i < mm + delta[0] || i > mm + delta[1]) sheet.hideSheet()
      else sheet.showSheet()
    }
  }
}

function showSheets_ () {
  const spreadsheet = SpreadsheetApp2.getActive().spreadsheet

  for (let i = 0; i < 12; i++) {
    const sheet = spreadsheet.getSheetByName(Consts.month_name.short[i])
    if (sheet) sheet.showSheet()
  }
}
