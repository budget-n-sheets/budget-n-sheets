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
  services: {
    cache: {
      document: null,
      user: null
    },
    properties: {
      document: null,
      user: null
    }
  }
};

class RapidAccess {
  static db () {
    return new RapidAccessDb(Goldfish.db);
  }

  static properties () {
    return new RapidAccessProperties(Goldfish.properties);
  }

  static services () {
    return new RapidAccessServices(Goldfish.services);
  }
}
