function toolInsertRows (sheet) {
  return toolService_('insertRows', sheet);
}

function toolService_ (name, param) {
  const lock = LockService.getDocumentLock();
  try {
    lock.waitLock(200);
  } catch (err) {
    return;
  }

  switch (name) {
    case 'insertRows': {
      if (!param) param = SpreadsheetApp.getActiveSheet();
      const tool = ToolInsertRows.pick(param);

      if (tool !== 1) tool.insertRows();
      else ToolInsertRows.showWarning();
      break;
    }

    default:
      break;
  }

  lock.releaseLock();
}
