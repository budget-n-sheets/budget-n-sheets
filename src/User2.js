/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

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
    return this.getId() === SettingsAdmin.get('admin_id');
  }

  static setId () {
    const email = Session.getEffectiveUser().getEmail();
    if (!email) throw new Error('User email is undefined.');

    this._userId = Utilities2.computeDigest('SHA_256', email, 'UTF_8');
    PropertiesService.getUserProperties().setProperty('user_id', this._userId);
  }
}
