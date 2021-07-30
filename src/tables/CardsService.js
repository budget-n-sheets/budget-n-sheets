class CardsService extends TablesService {
  constructor () {
    const db = RapidAccess.db().cards();
    super(db);
  }

  static isEmpty () {
    if (this._db == null) this._db = RapidAccess.db().cards();
    return this._db.count === 0;
  }

  hasCode (code) {
    return this._db.codes.indexOf(code) !== -1;
  }

  hasSlotAvailable () {
    return this._db.count < 10;
  }
}
