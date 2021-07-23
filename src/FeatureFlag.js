class FeatureFlag {
  static getStatusOf (name) {
    switch (name) {
      case 'setup/restore':
      case 'setup/copy':
      case 'settings/backup':
        break;

      default:
        return false;
    }

    return PropertiesService.getScriptProperties().getProperty(name) === 'true';
  }
}
