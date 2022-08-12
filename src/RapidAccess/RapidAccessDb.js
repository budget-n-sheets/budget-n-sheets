class RapidAccessDb {
  constructor (db) {
    this._db = db;
  }

  accounts () {
    return this._db.accounts ||
          (this._db.accounts = CachedProperties.withDocument().get('db_accounts'));
  }

  cards () {
    return this._db.cards ||
          (this._db.cards = CachedProperties.withDocument().get('db_cards'));
  }
}
