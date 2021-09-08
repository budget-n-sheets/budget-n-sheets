function toolFormatTable (sheet) {
  return toolService_('formatTable', sheet);
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

      if (tool !== 1) tool.setRanges(ranges).format();
      else FormatTable.showWarning();
      break;
    }
    case 'insertRows': {
      const tool = ToolInsertRows.pick(sheet);

      if (tool !== 1) tool.insertRows();
      else ToolInsertRows.showWarning();
      break;
    }

    default:
      console.warn('toolService_(): Switch case is default.', name);
      break;
  }

  lock.releaseLock();
}
