function accountsService (payload) {
  const lock = LockService.getDocumentLock();
  try {
    lock.waitLock(2000);
  } catch (err) {
    console.warn(err);
    return 1;
  }

  switch (payload.job) {
    case 'get':
      return new AccountsService().getById(payload.id);
    case 'list':
      return new AccountsService().getAll();

    default:
      console.error('accountsService(): Switch case is default.', payload.job);
      return 1;
  }
}

function cardsService (payload) {
  const lock = LockService.getDocumentLock();
  try {
    lock.waitLock(2000);
  } catch (err) {
    console.warn(err);
    return 1;
  }

  switch (payload.job) {
    case 'get':
      return new CardsService().getById(payload.id);
    case 'list':
      return new CardsService().getAll();
    case 'update':
      const service = new CardsService();
      service.update(payload).flush().save();
      break;

    default:
      console.error('cardsService(): Switch case is default.', payload.job);
      return 1;
  }
}
