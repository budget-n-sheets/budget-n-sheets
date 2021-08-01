class CardsService extends TablesService {
  constructor () {
    const db = RapidAccess.db().cards();
    super('cards', db);
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

  update (metadata) {
    if (!this.hasId(metadata.id)) return 1;

    metadata.code = metadata.code.trim();
    if (!/^\w+$/.test(metadata.code)) return 10;

    const pos = this._db.ids.indexOf(metadata.id);
    for (let i = 0; i < this._db.codes.length; i++) {
      if (i !== pos && this._db.codes[i] === metadata.code) return 11;
    }

    let aliases = metadata.aliases.match(/\w+/g);
    if (aliases == null) aliases = [];

    let c = aliases.indexOf(metadata.code);
    while (c !== -1) {
      aliases.splice(c, 1);
      c = aliases.indexOf(metadata.code);
    }

    this._db.codes[pos] = metadata.code;

    this._db.data[pos] = {
      id: metadata.id,
      name: metadata.name,
      code: metadata.code,
      aliases: aliases,
      limit: Number(metadata.limit)
    };

    return this;
  }
}
