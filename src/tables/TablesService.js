class TablesService {
  constructor (db) {
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
}
