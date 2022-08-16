class TablesService {
  constructor (key, db) {
    this.spreadsheet = null;
    this.formater = new FormatNumber();

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

  initSpreadsheet_ () {
    if (this.spreadsheet == null) this.spreadsheet = SpreadsheetApp3.getActive();
  }

  getAll () {
    return Utils.deepCopy(this._db);
  }

  getAny () {
    const n = this._ids.length;
    if (n < 1) return null;

    const i = Noise.randomInteger(n);
    const id = this._ids[i];
    return { id: id, metadata: Utils.deepCopy(this._db[id]) };
  }

  getById (id) {
    return Utils.deepCopy(this._db[id]);
  }

  hasId (id) {
    return this._ids.indexOf(id) !== -1;
  }

  save () {
    CachedProperties.withDocument().update(this._key, this._db);
    this._ids = Object.keys(this._db);
  }
}
