class CardsService extends TablesService {
  constructor () {
    const db = RapidAccess.db().cards();
    super('cards', db);
  }

  static isEmpty () {
    if (this._db == null) this._db = RapidAccess.db().cards();
    return this._db.count === 0;
  }

  getAllBalances () {
    const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('_Backstage');
    if (!sheet) return;

    const _h = TABLE_DIMENSION.height;
    const _w = TABLE_DIMENSION.width;

    const num_acc = SettingsConst.getValueOf('number_accounts');

    const col = 2 + _w + _w * num_acc;
    const num_cards = this._db.count;

    if (num_cards === 0) return;

    const balances = {
      cards: ['All'],
      balance: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ]
    };

    let data = sheet.getRange(1, col, 1 + 12 * _h, _w).getValues();
    for (let i = 0; i < 12; i++) {
      balances.balance[0][i] = data[5 + _h * i][0];
    }

    data = sheet.getRange(1, col + _w, 1 + 12 * _h, _w * num_cards).getValues();

    for (let k = 0; k < num_cards; k++) {
      if (data[0][_w * k] === '') continue;

      const code = data[0][_w * k].match(/\w+/g);
      if (code == null) continue;

      let i = 0;
      for (; i < code.length; i++) {
        if (this._db.codes.indexOf(code[i]) !== -1) break;
      }
      if (i === code.length) continue;

      balances.cards.push(code[i]);

      const v = [];
      for (let i = 0; i < 12; i++) {
        v[i] = data[5 + _h * i][_w * k];
      }

      balances.balance.push(v);
    }

    return balances;
  }

  updateMetadata_ () {
    const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('_Backstage');
    if (!sheet) return;

    const metadata = [];
    for (let k = 0; k < this._db.data.length; k++) {
      metadata[k] = {};
      Object.assign(metadata[k], this._db.data[k]);
      delete metadata[k].id;
    }

    const list_metadata = sheet.createDeveloperMetadataFinder()
      .withVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
      .withKey('db_cards')
      .find();

    if (list_metadata.length > 0) {
      list_metadata[0].setValue(JSON.stringify(metadata));
    } else {
      sheet.addDeveloperMetadata(
        'db_cards',
        JSON.stringify(metadata),
        SpreadsheetApp.DeveloperMetadataVisibility.PROJECT
      );
    }
  }

  updateNames_ () {
    const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('_Backstage');
    if (!sheet) return;

    const _h = TABLE_DIMENSION.height;
    const _w = TABLE_DIMENSION.width;
    const num_acc = SettingsConst.getValueOf('number_accounts');

    let k = 0;
    let col = 2 + _w + _w * num_acc + _w;
    while (k < this._db.count) {
      const card = this._db.data[k];

      const ranges = [];
      for (let i = 0; i < 12; i++) {
        ranges[i] = rollA1Notation(2 + _h * i, col + 1);
      }

      let text = '^' + card.code + '$';
      for (let i = 0; i < card.aliases.length; i++) {
        text += '|^' + card.aliases[i] + '$';
      }

      sheet.getRange(1, col).setValue(text);
      sheet.getRangeList(ranges).setValue('=' + FormatNumber.localeSignal(card.limit));
      col += _w;
      k++;
    }

    while (k < 10) {
      sheet.getRange(1, col).setValue('');
      col += _w;
      k++;
    }
  }

  updateRules_ () {
    const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('Cards');
    if (!sheet) return;

    const height = sheet.getMaxRows() - 5;
    if (height < 1) return;

    const rangeOff1 = sheet.getRange(2, 2);
    const rangeOff2 = sheet.getRange(6, 3, height, 1);

    if (this._db.count === 0) {
      for (let i = 0; i < 12; i++) {
        rangeOff1.offset(0, 6 * i).clearDataValidations();
        rangeOff2.offset(0, 6 * i).clearDataValidations();
      }

      SpreadsheetApp.flush();
      return;
    }

    const list1 = ['All'];
    const list2 = [];

    for (let i = 0; i < this._db.count; i++) {
      const card = this._db.data[i];

      list1.push(card.code);
      list2.push(card.code);

      for (let j = 0; j < card.aliases.length; j++) {
        list2.push(card.aliases[j]);
      }
    }

    const rule1 = SpreadsheetApp.newDataValidation()
      .requireValueInList(list1, true)
      .setAllowInvalid(true)
      .build();

    const rule2 = SpreadsheetApp.newDataValidation()
      .requireValueInList(list2, true)
      .setAllowInvalid(true)
      .build();

    for (let i = 0; i < 12; i++) {
      rangeOff1.offset(0, 6 * i)
        .clearDataValidations()
        .setDataValidation(rule1);

      rangeOff2.offset(0, 6 * i)
        .clearDataValidations()
        .setDataValidation(rule2);
    }

    SpreadsheetApp.flush();
  }

  create (metadata) {
    if (!this.hasSlotAvailable()) return 12;

    metadata.code = metadata.code.trim();
    if (!/^\w+$/.test(metadata.code)) return 10;
    if (this.hasCode(metadata.code)) return 11;

    let aliases = metadata.aliases.match(/\w+/g);
    if (aliases == null) aliases = [];

    let c = aliases.indexOf(metadata.code);
    while (c !== -1) {
      aliases.splice(c, 1);
      c = aliases.indexOf(metadata.code);
    }

    const random = TablesUtils.getUtid();
    if (!random) return 1;

    metadata.id = random;
    metadata.aliases = aliases;
    metadata.limit = Number(metadata.limit);

    c = this._db.count++;

    this._db.ids[c] = metadata.id;
    this._db.codes[c] = metadata.code;
    this._db.data[c] = metadata;
  }

  delete (id) {
    if (!this.hasId(id)) return 1;

    const pos = this._db.ids.indexOf(id);

    this._db.count--;
    this._db.ids.splice(pos, 1);
    this._db.codes.splice(pos, 1);
    this._db.data.splice(pos, 1);
  }

  flush () {
    this.updateMetadata_();
    this.updateNames_();
    this.updateRules_();

    SpreadsheetApp.flush();
    onOpen();
    return this;
  }

  hasCards () {
    return this._db.count > 0;
  }

  hasCode (code) {
    return this._db.codes.indexOf(code) !== -1;
  }

  hasSlotAvailable () {
    return this._db.count < 10;
  }

  update (metadata) {
    if (!this.hasId(metadata.id)) return 1;

    metadata.code = metadata.code.trim();
    if (!/^\w+$/.test(metadata.code)) return 10;

    const pos = this._db.ids.indexOf(metadata.id);
    for (let i = 0; i < this._db.codes.length; i++) {
      if (i !== pos && this._db.codes[i] === metadata.code) return 11;
    }

    let aliases = metadata.aliases.match(/\w+/g);
    if (aliases == null) aliases = [];

    let c = aliases.indexOf(metadata.code);
    while (c !== -1) {
      aliases.splice(c, 1);
      c = aliases.indexOf(metadata.code);
    }

    this._db.codes[pos] = metadata.code;

    this._db.data[pos] = {
      id: metadata.id,
      name: metadata.name,
      code: metadata.code,
      aliases: aliases,
      limit: Number(metadata.limit)
    };

    return this;
  }
}
