/**
 * SessionService: Temporarily caches values for streamline processing
 * Copyright (C) 2022 Guilherme T Maeoka
 * <https://github.com/guimspace/SessionService>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

class SuperSession {
  constructor (uuid = '') {
    this.cache_ = CacheService3.user();
    this._uuid = uuid.concat('') || Utilities.getUuid();
    this._user = Session.getTemporaryActiveUserKey();
    this._rootPath = SessionService.computeSignature(['session', this._user, this._uuid].join('/'));

    if (uuid) {
      if (uuid !== this.cache_.get(this._rootPath)?.uuid) throw new Error('Session expired.');
    } else {
      this.cache_.put(this._rootPath, {
        ttl: new Date().getTime() + 600 * 1000,
        uuid: this._uuid,
        context: {}
      });
    }
  }

  getContext_ (b, name) {
    const session = this.getSession_();

    const path = this.getPath_(name);
    const uuid = session.context[path]?.uuid;
    if (!uuid) return b ? null : this;

    delete session.context[path];
    this.cache_.put(this._rootPath, session);

    const key = this.getPath_(name.concat(uuid));
    const value = b ? this.cache_.get(key) : this;
    this.cache_.remove(key);

    return value;
  }

  getPath_ (name = '') {
    name.concat('');
    if (!name.length) throw new Error('Invalid context name.');
    return SessionService.computeSignature(['session', this._user, this._uuid].concat(name).join('/'));
  }

  getSession_ () {
    const session = this.cache_.get(this._rootPath);

    if (session == null) throw new Error('Session expired.');
    if (session.ttl < new Date().getTime()) {
      this.cache_.remove(this._rootPath);
      throw new Error('Session expired.');
    }

    return session;
  }

  createContext (name, value, expiration = 600) {
    const uuid = Utilities.getUuid();
    const t = expiration > 600 ? 600 : expiration;

    const session = this.getSession_();

    const path = this.getPath_(name);
    session.context[path] = { uuid: uuid };
    this.cache_.put(this._rootPath, session);

    const key = this.getPath_(name.concat(uuid));
    this.cache_.put(key, value, t);

    return this;
  }

  end () {
    this.cache_.remove(this._rootPath);
  }

  endContext (name) {
    return this.getContext_(0, name);
  }

  getUuid () {
    return this._uuid;
  }

  retrieveContext (name) {
    return this.getContext_(1, name);
  }
}
