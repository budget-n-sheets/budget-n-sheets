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

class PatchThis {
  constructor () {
    this._source = null;
    this._reference = null;
    this._patches = null;

    this._control = {
      major: { pos: 0 },
      minor: { pos: 0, list: [], ref: -1 },
      patch: { pos: 0, list: [], ref: -1 }
    };

    this.names = ['major', 'minor', 'patch'];
    this.response = 1;
  }

  minor_ () {
    const control = this._control.patch;
    if (control.list == null || control.list.length === 0) {
      this.response = 1;
      return;
    }

    do {
      control.pos++;
      if (control.pos >= control.list.length) {
        control.pos--;
        break;
      } else if (control.list[control.pos] !== '') {
        try {
          const name = control.list[control.pos];
          this.response = this[name]();
        } catch (err) {
          LogLog.error(err);
          this.response = 2;
        }
      }
    } while (this.response === 0 && control.pos !== control.ref);

    if (this.response !== 0) control.pos--;
  }

  major_ () {
    const control = this._control.minor;
    if (control.list == null || control.list.length === 0) {
      this.response = 1;
      return;
    }

    let lastPatch = this._control.patch.pos;
    let t = true;

    do {
      if (control.ref !== -1 && control.pos === control.ref) this._control.patch.ref = this._reference.patch;
      if (control.pos >= control.list.length) {
        control.pos -= 2;
        t = false;
      } else if (control.list[control.pos]) {
        this._control.patch.list = control.list[control.pos];
        this.minor_();
      }

      if (this.response !== 0 || (control.ref !== -1 && control.pos === control.ref)) {
        t = false;
      } else {
        control.pos++;
        if (this._control.patch.pos === -1) break;
        lastPatch = this._control.patch.pos;
        this._control.patch.pos = -1;
      }
    } while (t);

    if (this.response !== 0 && this._control.patch.pos === -1) {
      control.pos--;
      this._control.patch.pos = lastPatch;
    } else if (this._control.patch.pos === -1) {
      this._control.patch.pos = lastPatch;
    }
  }

  fromVer (v) {
    this._source = v;
    return this;
  }

  getPosition () {
    return {
      major: this._control.major.pos,
      minor: this._control.minor.pos,
      patch: this._control.patch.pos
    };
  }

  makeConfig () {
    if (this._source == null) throw new Error('PatchThis: makeConfig(): Source was not defined.');
    if (this._reference == null) throw new Error('PatchThis: makeConfig(): Reference was not defined.');
    if (this._patches == null) throw new Error('PatchThis: makeConfig(): Patches were not defined.');

    for (const name of this.names) {
      this._control[name].pos = this._source[name];
    }

    this.response = 0;

    return this;
  }

  setPatches (patches) {
    this._patches = patches;
    return this;
  }

  update () {
    const control = this._control.major;

    let lastMinor = this._control.minor.pos;
    let lastPatch = this._control.patch.pos;
    let t = true;

    do {
      this._control.minor.ref = (control.pos === this._reference.major ? this._reference.minor : -1);

      if (control.pos >= this._patches.length) {
        control.pos -= 2;
        t = false;
      } else if (this._patches[control.pos]) {
        this._control.minor.list = this._patches[control.pos];
        this.major_();
      }

      if (this.response !== 0 || control.pos === this._reference.major) {
        t = false;
      } else {
        control.pos++;
        if (this._control.patch.pos === -1) break;
        lastMinor = this._control.minor.pos;
        lastPatch = this._control.patch.pos;
        this._control.minor.pos = 0;
        this._control.patch.pos = -1;
      }
    } while (t);

    if (this.response !== 0) {
      if (this._control.minor.pos === -1) {
        control.pos--;
        this._control.minor.pos = lastMinor;
      } else if (this._control.minor.pos === 0 && this._control.patch.pos === -1) {
        control.pos--;
        this._control.patch.pos = lastPatch;
      }

      if (this._control.patch.pos === -1) this._control.patch.pos = lastPatch;
    } else if (this._control.minor.pos === -1) {
      this._control.minor.pos = 0;
    } else if (this._control.patch.pos === -1) {
      this._control.minor.pos = lastMinor;
      this._control.patch.pos = lastPatch;
    }

    return this;
  }

  toVer (v) {
    this._reference = Object.freeze(Object.assign({}, v));
    return this;
  }
}
