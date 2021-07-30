class AccountsService extends TablesService {
  constructor () {
    const db = RapidAccess.db().accounts();
    super('accounts', db);
  }
}
