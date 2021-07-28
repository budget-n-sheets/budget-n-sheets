class User2 {
  static getId () {
    this._userId = CacheService.getUserCache().get('user_id');
    if (this._userId) return this._userId;

    this._userId = PropertiesService.getUserProperties().getProperty('user_id');
    if (!this._userId) this.setId();

    CacheService.getUserCache().put('user_id', this._userId);
    return this._userId;
  }

  static isAdmin () {
    return this.getId() === SettingsAdmin.getValueOf('admin_id');
  }

  static setId () {
    const email = Session.getEffectiveUser().getEmail();
    if (!email) throw new Error('User email is undefined.');

    this._userId = computeDigest('SHA_256', email, 'UTF_8');
    PropertiesService.getUserProperties().setProperty('user_id', this._userId);
  }
}
