class SettingsConst extends Settings {
  static get _config () {
    return {
      protect: true
    };
  }

  static get _key () {
    return 'const_properties';
  }

  static get _scope () {
    return 'document';
  }
}
