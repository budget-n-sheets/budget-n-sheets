class BackupPatch extends PatchThis {
  constructor (payload) {
    super();

    this._payload = payload;

    this._source = (payload.metadata ?? payload.backup).version;
    this._reference = Object.freeze(Object.assign({}, Info.backup.version));
    this._patches = [
      [
        null,
        [null, 'patchV0m1p1_', 'v0m1p2_'],
        ['v0m2p0_']
      ]
    ];

    this.position = {};
  }

  get payload () {
    return this._payload;
  }

  v0m2p0_ () {
    this._payload.tags_categories = Consts.tags_categories;

    return 0;
  }

  v0m1p2_ () {
    const o = this._payload;

    for (const k in o.db_tables.accounts) {
      const acc = o.db_tables.accounts[k];
      Object.assign(acc, { color: 'whitesmoke' });
    }

    for (const k in o.db_tables.cards) {
      const card = o.db_tables.cards[k];
      Object.assign(card, { color: 'whitesmoke' });
    }

    return 0;
  }

  patchV0m1p1_ () {
    const o = this._payload;
    let sub;

    delete Object.assign(o, { metadata: o.backup }).backup;

    sub = o.metadata;
    delete Object.assign(sub, { spreadsheet_name: sub.spreadsheet_title }).spreadsheet_title;

    for (const k in o.db_tables.accounts) {
      const acc = o.db_tables.accounts[k];
      delete Object.assign(acc, { time_start: acc.time_a }).time_a;

      delete acc.time_z;
    }

    sub = o.user_settings;
    delete Object.assign(sub, { financial_calendar: sub.sha256_financial_calendar }).sha256_financial_calendar;

    return 0;
  }

  setPosition_ () {
    this._payload.metadata.version = this.getPosition();
    return this;
  }

  run () {
    if (PatchThisUtils.isLatestVersion(this._source, this._reference)) {
      this.response = 0;
      return this;
    }

    this.makeConfig().update();

    this.setPosition_();
    return this;
  }
}
