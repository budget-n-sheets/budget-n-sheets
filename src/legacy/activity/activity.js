function switchActivity_ (select, param1, param2) {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(200)) return 1;

  switch (select) {
    case 'resume':
      resumeActivity_(param1, param2);
      break;
    case 'suspend':
      suspendActivity_(param1, param2);
      break;

    default:
      throw new Error('switchActivity_(): Invalid case. ' + select);
  }

  lock.releaseLock();
  return 0;
}
