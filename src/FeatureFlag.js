class FeatureFlag {
  static getStatusOf (name) {
    switch (name) {
      case 'setup/restore':
      case 'setup/copy':
      case 'settings/backup':
        break;

      default:
        ConsoleLog.warn('FeatureFlag: getStatusOf(name): Switch case is default. ' + name);
        return false;
    }

    return PropertiesService.getScriptProperties().getProperty(name) === 'true';
  }
}
