/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

function toolRefreshCashFlow () {
  toolService_('cashFlow')
}

function toolFormatTable () {
  toolService_('formatTable')
}

function toolForwardInstallments () {
  toolService_('forwardInstallments')
}

function toolInsertRows () {
  toolService_('insertRows')
}

function toolService_ (job) {
  const lock = LockService.getDocumentLock()
  if (!lock.tryLock(800)) return

  const ranges = SpreadsheetApp.getActiveRangeList().getRanges()
  const sheet = ranges[0].getSheet()

  switch (job) {
    case 'cashFlow':
      RefreshCashFlowService.serve(sheet, ranges)
      break
    case 'formatTable':
      FormatTableService.serve(sheet, ranges)
      break
    case 'forwardInstallments': {
      const tool = ForwardInstallments.pick(sheet)
      if (tool === 1) {
        ForwardInstallments.showWarning()
        break
      } else if (!tool.sheet) {
        showDialogErrorMessage()
        break
      }

      const filtered = RangeUtils.filterTableRanges(ranges, tool.specs)
      tool.indexes = filtered.indexes
      tool.ranges = filtered.ranges

      tool.forward()
      break
    }
    case 'insertRows':
      InsertRowsService.serve(sheet)
      break

    default:
      console.warn('toolService_(): Switch case is default.', job)
      break
  }

  lock.releaseLock()
}
