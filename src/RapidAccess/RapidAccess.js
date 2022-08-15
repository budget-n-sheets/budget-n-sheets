const Goldfish = {
  db: {
    accounts: null,
    cards: null
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

  static spreadsheet () {
    return new RapidAccessSpreadsheet(Goldfish.spreadsheet);
  }
}
