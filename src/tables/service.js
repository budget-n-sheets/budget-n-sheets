/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

function accountsClientService (payload) {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(1000)) return 1;

  switch (payload.job) {
    case 'get':
      return new AccountsService().getById(payload.id);
    case 'list': {
      const accs = new AccountsService().getAll();
      return Object.keys(accs).map(key => Object.assign(accs[key], { id: key })).sort((a, b) => a.index - b.index);
    }
    case 'update': {
      const service = new AccountsService();
      service.update(payload.id, payload.metadata).save();
      service.flush();
      break;
    }

    default:
      console.error('accountsClientService(): Switch case is default.', payload.job);
      return 1;
  }
}

function cardsClientService (payload) {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(1000)) return 1;

  switch (payload.job) {
    case 'create': {
      const service = new CardsService();
      service.create(payload.metadata);
      service.save();
      service.flush();
      onOpen();
      break;
    }
    case 'get':
      return new CardsService().getById(payload.id);
    case 'list': {
      const cards = new CardsService().getAll();
      return Object.keys(cards).map(key => Object.assign(cards[key], { id: key })).sort((a, b) => b.index - a.index);
    }
    case 'update': {
      const service = new CardsService();
      service.update(payload.id, payload.metadata).save();
      service.flush();
      break;
    }

    default:
      console.error('cardsClientService(): Switch case is default.', payload.job);
      return 1;
  }
}
