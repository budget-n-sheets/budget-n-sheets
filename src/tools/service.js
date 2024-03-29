/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

function toolRefreshCashFlow () {
  toolService_('cashFlow');
}

function toolFormatTable () {
  toolService_('formatTable');
}

function toolForwardInstallments () {
  toolService_('forwardInstallments');
}

function toolInsertRows (sheet) {
  toolService_('insertRows', sheet);
}

function toolService_ (job, param) {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(800)) return;

  const ranges = (param ? param.getActiveRangeList() : SpreadsheetApp.getActiveRangeList()).getRanges();
  const sheet = ranges[0].getSheet();

  switch (job) {
    case 'cashFlow': {
      if (!RefreshCashFlow.isCompatible(sheet)) {
        RefreshCashFlow.showWarning();
        break;
      }

      const tool = new RefreshCashFlow();
      if (!tool.sheet) {
        RefreshCashFlow.showWarning();
        break;
      }

      tool.filterRanges(ranges).refresh();
      break;
    }
    case 'formatTable': {
      const tool = FormatTable.pick(sheet);
      if (tool === 1) {
        FormatTable.showWarning();
        break;
      } else if (!tool.sheet) {
        showDialogErrorMessage();
        break;
      }

      const selected = RangeUtils.filterTableRanges(ranges, tool.specs);
      tool.indexes = selected.indexes;
      tool.ranges = selected.ranges;

      tool.format();
      break;
    }
    case 'forwardInstallments': {
      if (!ForwardInstallments.isCompatible(sheet)) {
        ForwardInstallments.showWarning();
        break;
      }

      const tool = new ForwardInstallments();
      if (!tool.sheet) {
        showDialogErrorMessage();
        break;
      }

      const filtered = RangeUtils.filterTableRanges(ranges, tool.specs);
      tool.indexes = filtered.indexes;
      tool.ranges = filtered.ranges;

      tool.forward();
      break;
    }
    case 'insertRows': {
      const tool = InsertRows.pick(sheet);
      if (tool === 1) {
        InsertRows.showWarning();
        break;
      } else if (!tool.sheet) {
        showDialogErrorMessage();
        break;
      }

      tool.insertRows();
      break;
    }

    default:
      console.warn('toolService_(): Switch case is default.', job);
      break;
  }

  lock.releaseLock();
}
