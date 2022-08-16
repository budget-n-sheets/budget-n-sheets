class SettingsSpreadsheet extends Settings {
  static get _key () {
    return 'spreadsheet_settings';
  }

  static get _scope () {
    return 'document';
  }

  static updateMetadata () {
    const keys = ['decimal_places'];
    const properties = this.getAll(keys);
    Spreadsheet3.getMetadata().set(this._key, properties);
  }
}
