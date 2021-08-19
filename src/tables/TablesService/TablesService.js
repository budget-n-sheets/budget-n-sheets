class TablesService {
  constructor (key, db) {
    this._key = key;
    this._db = db;

    this._ids = Object.keys(db);
  }

  getNextIndex_ () {
    const indexes = [];
    for (const id in this._db) {
      indexes.push(this._db[id].index);
    }

    let index = 0;
    while (indexes.indexOf(index) !== -1) { index++; }

    return index;
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
