/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class CardsService extends TablesService {
  constructor () {
    const db = CachedProperties.withDocument().get('db_cards')
    super('db_cards', db);
  }

  static isEmpty () {
    return Object.keys(CachedProperties.withDocument().get('db_cards') || {}).length === 0;
  }

  formatValues_ (card) {
    card.name = card.name.trim().replace(/\s+/g, ' ').slice(0, 64);
    card.code = card.code.trim().replace(/\s+/g, '').slice(0, 16);

    if (!Array.isArray(card.aliases)) {
      card.aliases = card.aliases.trim()
        .replace(/\s/g, '')
        .split(',')
        .filter(alias => /^\w{1,16}$/.test(alias))
    }
    card.aliases = card.aliases.filter(alias => alias !== card.code).slice(0, 16);

    card.limit = Number(card.limit);
    if (!Consts.color_palette[card.color]) card.color = 'whitesmoke';
  }

  updateMetadata_ () {
    const metadata = {};

    let k = 0;
    for (const id in this._db) {
      metadata[k] = {};
      Object.assign(metadata[k], this._db[id]);
      k++;
    }

    SpreadsheetApp2.getActive().getMetadata().set('db_cards', metadata);
  }

  updateNames_ () {
    const sheet = this.spreadsheet.getSheetByName('_Backstage');
    if (!sheet) return;

    const _h = TABLE_DIMENSION.height;
    const _w = TABLE_DIMENSION.width;
    const num_acc = SettingsConst.get('number_accounts');

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
      sheet.getRangeList(ranges).setValue('=' + this.formater.localeSignal(card.limit));
    }
  }

  create (metadata) {
    if (!this.hasSlotAvailable()) return 12;

    this.formatValues_(metadata);

    if (!/^\w{1,16}$/.test(metadata.code)) return 10;
    if (this.hasCode(metadata.code)) return 11;

    const id = TablesUtils.getUtid();
    if (!id) return 1;

    const card = {
      index: 0,
      name: '',
      code: '',
      aliases: [],
      limit: 0,
      color: 'whitesmoke'
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
    this.initSpreadsheet_();

    this.updateMetadata_();
    this.updateNames_();
    TablesService.updateRules()
    TablesService.updateConditionalColor()

    SpreadsheetApp.flush();
    return this;
  }

  getAllBalances () {
    if (!this.hasCards()) return null;

    const _h = TABLE_DIMENSION.height;
    const _w = TABLE_DIMENSION.width;

    const cards = this.getAll();

    const num_acc = SettingsConst.get('number_accounts');
    const snapshot = new SheetBackstage().getGroupRange(0, 2 + num_acc, 12, 10).getValues();

    for (const id in cards) {
      const card = cards[id];
      const index = card.index;

      card.balances = new Array(12).fill(0);
      for (let i = 0; i < 12; i++) {
        card.balances[i] = +snapshot[4 + _h * i][_w * index];
      }
    }

    return cards;
  }

  getByCode (code, withAliases) {
    for (const id in this._db) {
      if (code === this._db[id].code ||
      (withAliases && this._db[id].aliases.indexOf(code) > -1)) return { id: id, metadata: Utils.deepCopy(this._db[id]) };
    }

    return null;
  }

  getCodesRegExp (withAliases) {
    if (!this.hasCards()) return null;

    const codes = [];
    for (const id in this._db) {
      codes.push(this._db[id].code);
      if (withAliases) codes.push(this._db[id].aliases);
    }

    const regExp = codes.flat()
      .sort((a, b) => b.length - a.length)
      .map(e => e.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'))
      .join('|');
    return new RegExp('(' + regExp + ')', 'g');
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

  update (id, metadata) {
    if (!this.hasId(id)) return 1;

    this.formatValues_(metadata);

    if (!/^\w{1,16}$/.test(metadata.code)) return 10;

    const card = this._db[id];
    metadata.index = card.index;

    for (const key in card) {
      card[key] = metadata[key];
    }

    return this;
  }
}
