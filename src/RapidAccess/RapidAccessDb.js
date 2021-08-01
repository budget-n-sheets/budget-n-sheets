class RapidAccessDb {
  constructor (db) {
    this._db = db;
  }

  accounts () {
    return this._db.accounts ||
          (this._db.accounts = CachedAccess.get('DB_TABLES').accounts);
  }

  cards () {
    return this._db.cards ||
          (this._db.cards = CachedAccess.get('DB_TABLES').cards);
  }
}
