function toolInsertRows (sheet) {
  return toolService_('insertRows', sheet);
}

function toolService_ (name, param) {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(200)) return;

  switch (name) {
    case 'insertRows': {
      const sheet = param || SpreadsheetApp.getActiveSheet();
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
