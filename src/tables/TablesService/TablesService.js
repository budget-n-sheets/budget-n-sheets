class TablesService {
  constructor (key, db) {
    this._key = key;
    this._db = db;
  }

  getAll () {
    return this._db.data;
  }

  getById (id) {
    const c = this._db.ids.indexOf(id);
    return (c === -1 ? null : this._db.data[c]);
  }

  hasId (id) {
    return this._db.ids.indexOf(id) !== -1;
  }

  save () {
    CachedAccess.update(this._key, this._db);
  }
}
