/**
 * Patch This: A basic patching system
 * Copyright (C) 2020 Guilherme T Maeoka
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

function update_major_ (v1, list, minor, patch, beta) {
  if (list == null || list.length === 0) return { r: 1, m: -1, p: -1 };

  let m = minor;
  let p = patch;
  let ver, pp, r, t;

  t = 0;
  pp = p;
  r = { r: 0, p: p };

  do {
    if (v1 && m === v1.minor) ver = v1;
    else ver = null;

    if (m >= list.length) {
      m -= 2;
      t = 1;
    } else if (list[m]) {
      r = update_minor_(ver, list[m], p, beta);
    }

    if (r.r || (ver && m === ver.minor)) {
      t = 1;
    } else {
      m++;
      pp = r.p;
      p = -1;
    }
  } while (!t);

  if (r.r && r.p === -1) {
    m--;
    r.p = pp;
  } else if (r.p === -1) {
    r.p = 0;
  }

  const b = r.b;
  p = r.p;
  r = r.r;

  return { r: r, m: m, p: p, b: b };
}
