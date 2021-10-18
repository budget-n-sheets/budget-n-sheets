class UpdateScript extends Update {
  constructor () {
    const v0 = ClassVersion.getValueOf('script');
    const vA = Info.apps_script.version;
    const list = [
      [
        null, [], [], [], [], [], [], [], [], [],
        [], [], [], [], [], [], [], [], [], [],
        [], [], [], [], [], [], [], [], [], [],
        [], [], [], [], [], [], [], [], [], [],
        [update_v0m40p0_, update_v0m40p1_],
        [null, null, null, update_v0m41p3_, null],
        [null, null, null, null, null, null, null, null, null, null, update_v0m42p10_, patchV0m42p11_, null, null, null, patchV0m42p15_, null, patchV0m42p17_, null, null, null, patchV0m42p21_, null, null, null, null, null, null, patchV0m42p28_, null, patchV0m42p30_, patchV0m42p31_, null, patchV0m42p33_, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null]
      ]
    ];

    super(v0, vA, list);

    this._key = 'script';
  }
}
