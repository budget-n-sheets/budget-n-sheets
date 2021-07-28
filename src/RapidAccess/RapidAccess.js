const Goldfish = {
  services: {
    cache: {
      document: null,
      user: null
    },
    properties: {
      document: null,
      user: null
    }
  },
  properties: {
    admin: null,
    const: null,
    spreadsheet: null,
    user: null
  }
};

class RapidAccess {
  static properties () {
    return new RapidAccessProperties(Goldfish.properties);
  }

  static services () {
    return new RapidAccessServices(Goldfish.services);
  }
}
