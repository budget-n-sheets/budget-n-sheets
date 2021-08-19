class CardsService extends TablesService {
  constructor () {
    const db = RapidAccess.db().cards();
    super('db_cards', db);
  }

  static isEmpty () {
    return Object.keys(RapidAccess.db().cards() || {}).length === 0;
  }

  formatValues_ (card) {
    card.name = card.name.trim();
    card.code = card.code.trim();

    if (!Array.isArray(card.aliases)) card.aliases = card.aliases.match(/\w+/g) || [];
    card.aliases = card.aliases.filter(alias => alias !== card.code);

    card.limit = Number(card.limit);
  }

  updateMetadata_ () {
    const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('_Backstage');
    if (!sheet) return;

    const metadata = {};

    let k = 0;
    for (const id in this._db) {
      metadata[k] = {};
      Object.assign(metadata[k], this._db[id]);
      k++;
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

    sheet.getRange(1, 2 + _w + _w * num_acc + _w, 1, 10 * _w).setValue('');

    for (const id in this._db) {
      const card = this._db[id];
      const index = card.index;

      const col = 2 + _w + _w * num_acc + _w + 1 + _w * index;

      const ranges = [];
      for (let i = 0; i < 12; i++) {
        ranges[i] = RangeUtils.rollA1Notation(2 + _h * i, col);
      }

      let text = '^' + card.code + '$';
      for (let i = 0; i < card.aliases.length; i++) {
        text += '|^' + card.aliases[i] + '$';
      }

      sheet.getRange(1, col - 1).setValue(text);
      sheet.getRangeList(ranges).setValue('=' + FormatNumber.localeSignal(card.limit));
    }
  }

  updateRules_ () {
    const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('Cards');
    if (!sheet) return;

    const height = sheet.getMaxRows() - 5;
    if (height < 1) return;

    const rangeOff1 = sheet.getRange(2, 2);
    const rangeOff2 = sheet.getRange(6, 3, height, 1);

    if (this._ids.length === 0) {
      for (let i = 0; i < 12; i++) {
        rangeOff1.offset(0, 6 * i).clearDataValidations();
        rangeOff2.offset(0, 6 * i).clearDataValidations();
      }

      SpreadsheetApp.flush();
      return;
    }

    const list1 = ['All'];
    let list2 = [];

    for (const id in this._db) {
      const card = this._db[id];

      list1.push(card.code);
      list2.push(card.code);

      list2 = list2.concat(card.aliases);
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

    this.formatValues_(metadata);

    if (!/^\w+$/.test(metadata.code)) return 10;
    if (this.hasCode(metadata.code)) return 11;

    const id = TablesUtils.getUtid();
    if (!id) return 1;

    const card = {
      index: 0,
      name: '',
      code: '',
      aliases: [],
      limit: 0
    };

    for (const key in card) {
      card[key] = metadata[key];
    }
    card.index = this.getNextIndex_();

    this._db[id] = {};
    Object.assign(this._db[id], card);

    return this;
  }

  delete (id) {
    if (!this.hasId(id)) return 1;

    const c = this._ids.indexOf(id);
    this._ids.splice(c, 1);

    delete this._db[id];

    return this;
  }

  flush () {
    this.updateMetadata_();
    this.updateNames_();
    this.updateRules_();

    SpreadsheetApp.flush();
    onOpen();

    return this;
  }

  getAllBalances () {
    const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('_Backstage');
    if (!sheet) return;

    const _h = TABLE_DIMENSION.height;
    const _w = TABLE_DIMENSION.width;

    const num_acc = SettingsConst.getValueOf('number_accounts');

    const col = 2 + _w + _w * num_acc;
    const num_cards = this._ids.length;

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

    for (const id in this._db) {
      const card = this._db[id];
      const index = card.index;

      const v = [];
      for (let i = 0; i < 12; i++) {
        v[i] = data[5 + _h * i][_w * index];
      }

      balances.cards.push(card.code);
      balances.balance.push(v);
    }

    return balances;
  }

  hasCards () {
    return this._ids.length > 0;
  }

  hasCode (code) {
    for (const id in this._db) {
      if (this._db[id].code === code) return true;
    }

    return false;
  }

  hasSlotAvailable () {
    return this._ids.length < 10;
  }

  update (metadata) {
    if (!this.hasId(metadata.id)) return 1;

    this.formatValues_(metadata);

    if (!/^\w+$/.test(metadata.code)) return 10;

    const card = this._db[metadata.id];
    metadata.index = card.index;

    for (const key in card) {
      card[key] = metadata[key];
    }

    return this;
  }
}
