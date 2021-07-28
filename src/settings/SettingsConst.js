class SettingsConst {
  static load_ () {
    this._properties = RapidAccess.properties().const();
  }

  static getValueOf (key) {
    switch (key) {
      case 'financial_year':
      case 'number_accounts':
      case 'date_created':
        this.load_();
        return this._properties[key];

      default:
        console.error('SettingsConst: getValueOf(): Switch case is default.', key);
        break;
    }
  }
}
