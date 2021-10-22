class Update extends PatchThis {
  constructor (v0, vA, list) {
    super();

    this._source = v0;
    this._reference = Object.freeze(Object.assign({}, vA));
    this._patches = list;

    this.status = 0;
    this.position = {};
  }

  setPosition_ () {
    ClassVersion.setValueOf(this._key, this.position);
    return this;
  }

  run () {
    this.status = 1;

    if (!SemVerUtils.hasSemVerFormat(this._source)) return this;
    if (!SemVerUtils.hasSemVerFormat(this._reference)) return this;
    if (SemVerUtils.hasMinimumVersion(this._source, this._reference)) {
      this.response = 0;
      return this;
    }

    this.makeConfig().update();

    this.position = this.getPosition();
    this.status = 2;

    this.setPosition_();
    return this;
  }
}
