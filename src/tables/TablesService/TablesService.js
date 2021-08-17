class TablesService {
  constructor (key, db) {
    this._key = key;
    this._db = db;

    this._ids = Object.keys(db);
  }

  getAll () {
    return this._db;
  }

  getById (id) {
    return this._db[id];
  }

  hasId (id) {
    return this._ids.indexOf(id) !== -1;
  }

  save () {
    CachedAccess.update(this._key, this._db);
  }
}
