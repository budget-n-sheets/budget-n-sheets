class UpdateTemplate extends Update {
  constructor () {
    const v0 = ClassVersion.getValueOf('template');
    const vA = Info.template.version;
    const list = {
      patches: [
        [
          null, [], [], [], [], [], [], [], [], [],
          [], [],
          [
            [null]
          ]
        ]
      ],
      beta: []
    };

    super(v0, vA, list);

    this._key = 'template';
  }
}
