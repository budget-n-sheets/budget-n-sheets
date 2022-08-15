class RapidAccessServices {
  constructor (services) {
    this._services = services;
  }

  properties () {
    return new RapidAccessServicesProperties(this._services.properties);
  }
}

class RapidAccessServicesProperties {
  constructor (properties) {
    this._properties = properties;
  }

  document () {
    return this._properties.document ||
          (this._properties.document = PropertiesService.getDocumentProperties());
  }

  user () {
    return this._properties.user ||
          (this._properties.user = PropertiesService.getUserProperties());
  }
}
