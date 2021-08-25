class ClassVersion {
  static getValueOf (key) {
    switch (key) {
      case 'script':
      case 'template':
        return CachedAccess.get('class_version2')[key];

      default:
        throw new Error('ClassVersion: getValueOf(): Switch case is default.', key);
    }
  }

  static setValueOf (key, newValue) {
    switch (key) {
      case 'script':
      case 'template': {
        const class_version2 = PropertiesService3.document().getProperty('class_version2');
        class_version2[key] = newValue;
        CachedAccess.update('class_version2', class_version2);
        break;
      }

      default:
        throw new Error('ClassVersion: setValueOf(): Switch case is default.', key);
    }
  }
}
