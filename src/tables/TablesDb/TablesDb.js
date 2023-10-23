/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class TablesDb {
  constructor (key) {
    this._key = key
    this._db = CachedProperties.withDocument().get(key)
    this.refreshIds_()
  }

  getUuid_ () {
    for (let i = 0; i < 10; i++) {
      const id = Utilities.getUuid()
      if (!this._db[id]) return id
      Utilities.sleep(40)
    }

    throw new Error('Service TablesDb failed to generate a UUID.')
  }

  indexOf_ (id) {
    return this._ids.indexOf(id)
  }

  refreshIds_ () {
    this._ids = Object.keys(this._db)
    this._ids.sort()
    this._ids.forEach((id, index) => this._db[id].index = index)
  }

  updateMetadata_ () {
    const metadata = {}
    this._ids
      .forEach((id, i) => {
        metadata[i] = {}
        Object.assign(metadata[i], this._db[id])
      })

    SpreadsheetApp2.getActive()
      .getMetadata()
      .set(this._key, metadata)
  }

  delete_ (id) {
    delete this._db[id]
    this.commit()
  }

  commit () {
    this.refreshIds_()
    CachedProperties.withDocument().update(this._key, this._db)
    this.updateMetadata_()
  }

  list () {
    return this._ids.map(id => this.get(id))
  }
}
