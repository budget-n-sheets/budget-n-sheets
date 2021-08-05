class BsAuth {
  constructor (spreadsheet) {
    this._spreadsheet = spreadsheet;
    this.load_();
  }

  load_ () {
    const list = this._spreadsheet.createDeveloperMetadataFinder()
      .withVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
      .withKey('bs_sig')
      .find();

    if (list.length === 0) {
      this.init_();
      return;
    }

    const metadata = JSON.parse(list[0].getValue());
    metadata.data = JSON.parse(Utilities2.base64DecodeWebSafe(metadata.data, 'UTF_8'));

    this._data = metadata.data;
    this._sig = metadata.sig;
  }

  init_ () {
    this._sig = '';
    this._data = {
      counter: 0,
      date: 0,
      admin_id: '',
      spreadsheet_id: this._spreadsheet.getId()
    };
  }

  set_ (metadata) {
    const list = this._spreadsheet.createDeveloperMetadataFinder()
      .withVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
      .withKey('bs_sig')
      .find();

    if (list.length > 0) {
      list[0].setValue(metadata);
    } else {
      this._spreadsheet.addDeveloperMetadata(
        'bs_sig', metadata,
        SpreadsheetApp.DeveloperMetadataVisibility.PROJECT
      );
    }
  }

  sign_ () {
    const key = Bs.getInnerKey();
    const value = Utilities.base64EncodeWebSafe(
      JSON.stringify(this._data),
      Utilities.Charset.UTF_8
    );

    this._sig = Utilities2.computeHmacSignature('SHA_256', value, key, 'UTF_8');
  }

  getValueOf (key) {
    switch (key) {
      case 'counter':
      case 'date':
      case 'admin_id':
      case 'spreadsheet_id':
        return this._data[key];
    }
  }

  hasSig () {
    return this._sig !== '';
  }

  update () {
    this._data.counter++;
    this._data.date = new Date().getTime();
    this._data.admin_id = SettingsAdmin.getValueOf('admin_id');

    this.sign_();

    const encoded = Utilities.base64EncodeWebSafe(
      JSON.stringify(this._data),
      Utilities.Charset.UTF_8
    );

    const metadata = JSON.stringify({
      data: encoded,
      sig: this._sig
    });

    this.set_(metadata);
  }

  verify () {
    const key = Bs.getInnerKey();
    const value = Utilities.base64EncodeWebSafe(
      JSON.stringify(this._data),
      Utilities.Charset.UTF_8
    );

    const hmac = Utilities2.computeHmacSignature('SHA_256', value, key, 'UTF_8');
    return hmac === this._sig;
  }
}
