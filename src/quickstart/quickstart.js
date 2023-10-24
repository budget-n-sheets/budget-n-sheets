/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

function alertQuickstartSheetMissing (name) {
  SpreadsheetApp2.getUi().alert(
    "Can't show example",
    'Sheet "' + name + "\" couldn't be found.",
    SpreadsheetApp2.getUi().ButtonSet.OK)
}

function playQuickstart (id) {
  if (!Addon.isInstalled()) return

  const channel = id.match(/([a-z_]+)(\d+)/)
  if (!channel) {
    console.warn('playQuickstart(): Now match found.', id)
    return
  }

  const lock = LockService.getDocumentLock()
  if (!lock.tryLock(200)) return

  const name = channel[1]
  const num = Number(channel[2])

  QuickstartPl.ay(name, num)

  lock.releaseLock()
}

function fillMonthWithZeros (sheet) {
  let lastRow
  let i, k

  lastRow = sheet.getLastRow()
  if (lastRow < 5) return

  lastRow -= 4
  const values = sheet.getRange(5, 1, lastRow, 10).getValues()

  let n = 0
  const list = []

  for (k = 0; k < 2; k++) {
    i = lastRow - 1
    while (i > -1 && values[i][2 + 5 * k] === '') { i-- }

    while (i > -1) {
      if (values[i][2 + 5 * k] === '') {
        list[n] = RangeUtils.rollA1Notation(5 + i, 3 + 5 * k)
        n++
      }
      i--
    }
  }

  if (list.length > 0) sheet.getRangeList(list).setValue(0)
  SpreadsheetApp.flush()
}

function fillCardWithZeros (sheet, col) {
  let lastRow
  let i, k

  lastRow = sheet.getLastRow()
  if (lastRow < 6) return

  lastRow -= 5
  const values = sheet.getRange(6, col, lastRow, 18).getValues()
  col += 3

  let n = 0
  const list = []

  for (k = 0; k < 3; k++) {
    i = lastRow - 1
    while (i > -1 && values[i][3 + 6 * k] === '') { i-- }

    while (i > -1) {
      if (values[i][3 + 6 * k] === '') {
        list[n] = RangeUtils.rollA1Notation(6 + i, col + 6 * k)
        n++
      }
      i--
    }
  }

  if (list.length > 0) sheet.getRangeList(list).setValue(0)
  SpreadsheetApp.flush()
}
