/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

function toggleViewMode_ () {
  const mode = SettingsSpreadsheet.get('view_mode')

  const response = setViewMode_(mode === 'simple')
  if (response === 1) {
    SpreadsheetApp2.getUi().alert(
      'Add-on is busy',
      'The add-on is busy. Try again in a moment.',
      SpreadsheetApp2.getUi().ButtonSet.OK)
  } else if (response === 2) {
    showDialogErrorMessage()
  }
}

function setViewMode_ (mode) {
  const lock = LockService.getDocumentLock()
  if (!lock.tryLock(200)) return 1

  try {
    if (mode) ViewModeNormal.set()
    else ViewModeCompact.set()
  } catch (err) {
    LogLog.error(err)
    return 2
  } finally {
    SettingsSpreadsheet.set('view_mode', mode ? 'complete' : 'simple')
    lock.releaseLock()
  }

  return 0
}
