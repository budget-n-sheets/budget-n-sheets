/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class Update extends PatchThis {
  constructor (source, reference, patches) {
    super(source, reference, patches);

    this._key = null;

    this.status = 0;
    this.position = {};
  }

  setPosition_ () {
    ClassVersion.set(this._key, this.position);
    return this;
  }

  run () {
    this.status = 1;

    if (PatchThisUtils.isLatestVersion(this.getPosition(), this._reference)) {
      this.response = 0;
      return this;
    }

    this.update();

    this.position = this.getPosition();
    this.status = 2;

    this.setPosition_();
    return this;
  }
}
