const Goldfish = {
  services: {}
};

class RapidAccessServices {
  constructor (services) {
    this._services = services;
  }
}

class RapidAccess {
  static services () {
    return new RapidAccessServices(Goldfish.services);
  }
}
