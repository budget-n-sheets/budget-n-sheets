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
  const lock = LockService.getDocumentLock()
  if (!lock.tryLock(1000)) return 1

  switch (payload.job) {
    case 'get': {
      const acc = new AccountsService().get(payload.id)
      return Object.assign(acc.data, { id: acc.id })
    }
    case 'list': {
      const accs = new AccountsService().list()
      return accs.map(acc => Object.assign(acc.data, { id: acc.id }))
    }
    case 'update': {
      const service = new AccountsService()
      const acc = service.get(payload.id)
      acc.data = payload.metadata
      service.update(acc)
      service.flush()
      break
    }

    default:
      console.error('accountsClientService(): Switch case is default.', payload.job)
      return 1
  }
}

function cardsClientService (payload) {
  const lock = LockService.getDocumentLock()
  if (!lock.tryLock(1000)) return 1

  switch (payload.job) {
    case 'create': {
      const service = new CardsService()
      service.create(payload.metadata)
      service.flush()
      onOpen()
      break
    }
    case 'get': {
      const card = new CardsService().get(payload.id)
      return Object.assign(card.data, { id: card.id })
    }
    case 'list': {
      const cards = new CardsService().list()
      return cards.map(card => Object.assign(card.data, { id: card.id }))
    }
    case 'update': {
      const service = new CardsService()
      const card = service.get(payload.id)
      card.data = payload.metadata
      service.update(card)
      service.flush()
      break
    }

    default:
      console.error('cardsClientService(): Switch case is default.', payload.job)
      return 1
  }
}
