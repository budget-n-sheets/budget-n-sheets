class CardsService extends TablesService {
  constructor () {
    const db = RapidAccess.db().cards();
    super(db);
  }
}
