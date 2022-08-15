const Goldfish = {
  db: {
    accounts: null,
    cards: null
  },
  properties: {
    admin: null,
    const: null,
    spreadsheet: null,
    user: null
  },
  spreadsheet: {
    _self: {},
    metadata: null,
    sheets: {}
  }
};

class RapidAccess {
  static db () {
    return new RapidAccessDb(Goldfish.db);
  }

  static properties () {
    return new RapidAccessProperties(Goldfish.properties);
  }

  static spreadsheet () {
    return new RapidAccessSpreadsheet(Goldfish.spreadsheet);
  }
}
