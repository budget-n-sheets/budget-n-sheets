class SettingsConst {
  static getValueOf (key) {
    switch (key) {
      case 'financial_year':
      case 'number_accounts':
      case 'date_created':
        return RapidAccess.properties().const()[key];

      default:
        console.error('SettingsConst: getValueOf(): Switch case is default.', key);
        break;
    }
  }
}
