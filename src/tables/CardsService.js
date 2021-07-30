class CardsService extends TablesService {
  constructor () {
    const db = RapidAccess.db().cards();
    super(db);
  }

  hasCode (code) {
    return this._db.codes.indexOf(code) !== -1;
  }

  hasSlotAvailable () {
    return this._db.count < 10;
  }
}
