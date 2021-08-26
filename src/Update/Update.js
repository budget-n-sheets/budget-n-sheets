class Update {
  constructor (v0, vA, list) {
    this._v0 = v0;
    this._vA = vA;
    this._list = list;

    this.status = 0;
    this.response = 1;
    this.position = {};
  }

  setPosition_ () {
    ClassVersion.setValueOf(this._key, this.position);
    return this;
  }

  run () {
    this.status = 1;

    if (!SemVerUtils.hasSemVerFormat(this._v0)) return this;
    if (!SemVerUtils.hasSemVerFormat(this._vA)) return this;
    if (SemVerUtils.hasMinimumVersion(this._v0, this._vA)) {
      this.response = 0;
      return this;
    }

    const patch = new PatchThis();

    patch.setPatches(this._list)
      .fromVer(this._v0)
      .toVer(this._vA)
      .makeConfig()
      .update();

    this.position = patch.getPosition();
    this.response = patch.response;
    this.status = 2;

    this.setPosition_();

    return this;
  }
}
