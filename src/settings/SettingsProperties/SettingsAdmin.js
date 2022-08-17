class SettingsAdmin extends Settings {
  static get _key () {
    return 'admin_settings';
  }

  static get _scope () {
    return 'document';
  }
}
