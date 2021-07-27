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
  }
};

class RapidAccess {
  static services () {
    return new RapidAccessServices(Goldfish.services);
  }
}
