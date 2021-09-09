function toolFormatTable () {
  return toolService_('formatTable');
}

function toolForwardInstallments () {
  toolService_('forwardInstallments');
}

function toolInsertRows (sheet) {
  return toolService_('insertRows', sheet);
}

function toolService_ (name, param) {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(200)) return;

  const ranges = (param ? param.getActiveRangeList() : SpreadsheetApp.getActiveRangeList()).getRanges();
  const sheet = ranges[0].getSheet();

  switch (name) {
    case 'formatTable': {
      const tool = FormatTable.pick(sheet);
      if (tool === 1) {
        FormatTable.showWarning();
        break;
      }

      const selected = RangeUtils.filterTableRanges(ranges, tool.specs);
      tool.indexes = selected.indexes;
      tool.ranges = selected.ranges;

      tool.format();
      break;
    }
    case 'forwardInstallments': {
      const tool = new ForwardInstallments();
      if (!tool.sheet) {
        ForwardInstallments.showWarning();
        break;
      }

      const filtered = RangeUtils.filterTableRanges(ranges, tool.specs);
      tool.indexes = filtered.indexes;
      tool.ranges = filtered.ranges;

      tool.forward();
      break;
    }
    case 'insertRows': {
      const tool = ToolInsertRows.pick(sheet);
      if (tool === 1) {
        ToolInsertRows.showWarning();
        break;
      }

      tool.insertRows();
      break;
    }

    default:
      console.warn('toolService_(): Switch case is default.', name);
      break;
  }

  lock.releaseLock();
}
