/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class TablesService {
  constructor (db) {
    this._db = db
  }

  create (data) {
    try {
      return this._db.create(data)
    } catch (e) {
      LogLog.error(e)
      return e.message
    }
  }

  get (id) {
    try {
      return this._db.get(id)
    } catch (e) {
      LogLog.error(e)
      return null
    }
  }

  list () {
    return this._db.list()
  }

  update (item) {
    try {
      this._db.update(item)
    } catch (e) {
      LogLog.error(e)
      return e.message
    }
    return null
  }
}
