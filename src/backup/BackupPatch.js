class BackupPatch extends PatchThis {
  constructor (payload) {
    super();

    this._payload = payload;

    this._source = payload.metadata.version;
    this._reference = Object.freeze(Object.assign({}, Info.backup.version));
    this._patches = [
      [
        null,
        [null, 'patchV0m1p1_']
      ]
    ];

    this.position = {};
  }

  get payload () {
    return this._payload;
  }

  patchV0m1p1_ () {
    const o = this._payload;

    delete Object.assign(o, { metadata: o.backup }).backup;
    o.metadata.spreadsheet_name = o.metadata.spreadsheet_title;
    delete o.metadata.spreadsheet_title;

    for (const k in o.db_tables.accounts) {
      const acc = o.db_tables.accounts[k];
      acc.time_start = acc.time_a;

      delete acc.time_a;
      delete acc.time_z;
    }

    o.user_settings.financial_calendar = o.user_settings.sha256_financial_calendar;
    delete o.user_settings.sha256_financial_calendar;

    return 0;
  }

  setPosition_ () {
    this._payload.metadata.version = this.getPosition();
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
