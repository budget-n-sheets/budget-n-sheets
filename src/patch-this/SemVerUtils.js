/**
 * Patch This: A basic patching system
 * Copyright (C) 2021 Guilherme Tadashi Maeoka
 * <https://github.com/guimspace/patch-this>
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

class SemVerUtils {
  static hasMinimumVersion (source, reference) {
    if (source.major > reference.major) return true;
    if (source.major === reference.major) {
      if (source.minor > reference.minor) return true;
      if (source.minor === reference.minor) {
        if (source.patch > reference.patch) return true;
        if (source.patch === reference.patch) {
          if (source.beta >= reference.beta) return true;
        }
      }
    }

    return false;
  }

  static hasSemVerFormat (v) {
    if (!Object.prototype.hasOwnProperty.call(v, 'major')) return false;
    if (typeof v.major !== 'number') return false;

    if (!Object.prototype.hasOwnProperty.call(v, 'minor')) return false;
    if (typeof v.minor !== 'number') return false;

    if (!Object.prototype.hasOwnProperty.call(v, 'patch')) return false;
    if (typeof v.patch !== 'number') return false;

    if (!Object.prototype.hasOwnProperty.call(v, 'beta')) return false;
    if (typeof v.beta !== 'number') return false;

    return true;
  }
}
