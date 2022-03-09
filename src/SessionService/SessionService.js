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

class SessionService {
  static computeSignature (value) {
    return Utilities2.computeHmacSignature(
      'SHA_256',
      value,
      Utilities2.computeDigest(
        'SHA_256',
        (function () {
          const c = CacheService.getScriptCache();
          return c.get('locksmith') || (function () {
            const v = PropertiesService.getScriptProperties().getProperty('locksmith');
            if (!v) throw new Error('Value not found.');
            c.put('locksmith', v);
            return v;
          })();
        })() + Session.getTemporaryActiveUserKey(),
        'UTF_8'),
      'UTF_8');
  }

  static endSession (uuid = '') {
    const path = SessionService.computeSignature(
      ['session',
        Session.getTemporaryActiveUserKey(),
        uuid.concat('')].join('/'));
    CacheService3.user().remove(path);
  }

  static getSession (uuid) {
    return new SuperSession(uuid);
  }

  static hasSession (uuid = '') {
    Utilities.sleep(400);
    const path = SessionService.computeSignature(
      ['session',
        Session.getTemporaryActiveUserKey(),
        uuid.concat('')].join('/'));
    return uuid === CacheService3.user().get(path)?.uuid;
  }

  static startSession () {
    return new SuperSession();
  }
}
