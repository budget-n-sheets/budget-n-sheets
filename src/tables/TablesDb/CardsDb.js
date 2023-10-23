/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class CardsDb extends TablesDb {
  constructor () {
    const key = 'db_cards'
    super(key)
  }

  create (data) {
    const id = this.getUuid_()
    const card = new Card(id)

    data.index = -1
    card.data = data

    for (const id of this._ids) {
      if (this._db[id].code === card.code) throw new Error('Duplicate card code.')
    }

    this._db[id] = card.data
    this.commit()
    card.index = this.indexOf_(id)

    return card
  }

  delete (id) {
    if (this._db[id]) this.delete_(id)
    else console.error('Card not found.')
  }

  get (id) {
    if (!this._db[id]) throw new Error('Card not found.')

    const card = new Card(id)
    card.data = this._db[id]

    return card
  }

  update (card) {
    if (!card instanceof Card) throw new Error('Invalid item.')

    const id = card.id
    if (!this._db[id]) throw new Error('Card not found.')

    card.index = -1
    this._db[id] = card.data
    this.commit()
    card.index = this.indexOf_(id)

    return card
  }
}
