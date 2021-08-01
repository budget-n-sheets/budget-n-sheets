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
    const db = PropertiesService3.document().getProperty('DB_TABLES');
    db[this._key] = this._db;
    CachedAccess.update('DB_TABLES', db);
  }
}
