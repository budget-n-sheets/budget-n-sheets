class BackupPatch extends PatchThis {
  constructor (payload) {
    super();

    this._payload = payload;

    this._source = payload.backup.version;
    this._reference = Object.freeze(Object.assign({}, Info.backup.version));
    this._patches = [
      [
        null, ['']
      ]
    ];

    this.position = {};
  }

  setPosition_ () {
    this._payload.backup.version = this.getPosition();
    return this;
  }

  run () {
    if (!SemVerUtils.hasSemVerFormat(this._source)) return this;
    if (!SemVerUtils.hasSemVerFormat(this._reference)) return this;
    if (SemVerUtils.hasMinimumVersion(this._source, this._reference)) {
      this.response = 0;
      return this;
    }

    this.makeConfig().update();

    this.setPosition_();
    return this;
  }
}
