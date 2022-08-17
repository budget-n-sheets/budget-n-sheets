class ClassVersion {
  static getValueOf (key) {
    switch (key) {
      case 'script':
      case 'template':
        return CachedProperties.withDocument().get('class_version2')[key];

      default:
        throw new Error('ClassVersion: getValueOf(): Switch case is default.', key);
    }
  }

  static setValueOf (key, newValue) {
    switch (key) {
      case 'script':
      case 'template': {
        const class_version2 = PropertiesService2.getDocumentProperties().getProperty('class_version2');
        class_version2[key] = newValue;
        CachedProperties.withDocument().update('class_version2', class_version2);
        break;
      }

      default:
        throw new Error('ClassVersion: setValueOf(): Switch case is default.', key);
    }
  }
}
