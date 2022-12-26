/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class RapidAccessDb {
  constructor (db) {
    this._db = db;
  }

  accounts () {
    return this._db.accounts ||
          (this._db.accounts = CachedProperties.withDocument().get('db_accounts'));
  }

  cards () {
    return this._db.cards ||
          (this._db.cards = CachedProperties.withDocument().get('db_cards'));
  }
}
