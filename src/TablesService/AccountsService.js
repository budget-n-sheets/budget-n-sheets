class AccountsService extends TablesService {
  constructor () {
    const db = RapidAccess.db().accounts();
    super('accounts', db);
  }

  update (metadata) {
    if (!this.hasId(metadata.id)) return 1;

    metadata.name = metadata.name.trim();
    if (metadata.name === '') return 1;

    const c = this._db.ids.indexOf(metadata.id);

    metadata.time_a = Number(metadata.time_a);
    metadata.balance = Number(metadata.balance);

    this._db.names[c] = metadata.name;

    this._db.data[c].name = metadata.name;
    this._db.data[c].time_a = metadata.time_a;
    this._db.data[c].balance = metadata.balance;

    return this;
  }
}
