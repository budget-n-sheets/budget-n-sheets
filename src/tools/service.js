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
      ToolInsertRows.pick(param).insertRows();
      break;
    }

    default:
      break;
  }

  lock.releaseLock();
}
