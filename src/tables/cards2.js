function getCardById_ (card_id) {
  const db_tables = getDbTables_('cards');
  const c = db_tables.ids.indexOf(card_id);
  if (c !== -1) return db_tables.data[c];
}

function addCard_ (card) {
  let aliases, c;

  card.code = card.code.trim();
  if (!/^\w+$/.test(card.code)) return 10;

  const db_cards = getDbTables_('cards');

  if (db_cards.count >= 10) return 12;
  if (db_cards.codes.indexOf(card.code) !== -1) return 11;

  aliases = card.aliases.match(/\w+/g);
  if (aliases == null) aliases = [];

  c = aliases.indexOf(card.code);
  while (c !== -1) {
    aliases.splice(c, 1);
    c = aliases.indexOf(card.code);
  }

  const random = genUniqueTableId_();
  if (!random) return 1;

  card.id = random;
  card.aliases = aliases;
  card.limit = Number(card.limit);

  c = db_cards.count++;

  db_cards.ids[c] = card.id;
  db_cards.codes[c] = card.code;
  db_cards.data[c] = card;

  setDbTables_(db_cards, 'cards');
  refreshCardName_('set', c, card);
  refreshCardsRules_();
}

function setCard_ (card) {
  let aliases;
  let c, i;

  card.code = card.code.trim();
  if (!/^\w+$/.test(card.code)) return 10;

  const db_cards = getDbTables_('cards');

  const pos = db_cards.ids.indexOf(card.id);
  if (pos === -1) return 1;

  for (i = 0; i < db_cards.codes.length; i++) {
    if (i !== pos && db_cards.codes[i] === card.code) return 11;
  }

  aliases = card.aliases.match(/\w+/g);
  if (aliases == null) aliases = [];

  c = aliases.indexOf(card.code);
  while (c !== -1) {
    aliases.splice(c, 1);
    c = aliases.indexOf(card.code);
  }

  db_cards.codes[pos] = card.code;

  db_cards.data[pos] = {
    id: card.id,
    name: card.name,
    code: card.code,
    aliases: aliases,
    limit: Number(card.limit)
  };

  setDbTables_(db_cards, 'cards');
  refreshCardName_('set', pos, db_cards.data[pos]);
  refreshCardsRules_();
}

function deleteCard_ (card_id) {
  const db_cards = getDbTables_('cards');

  const pos = db_cards.ids.indexOf(card_id);
  if (pos === -1) return;

  db_cards.count--;
  db_cards.ids.splice(pos, 1);
  db_cards.codes.splice(pos, 1);
  db_cards.data.splice(pos, 1);

  setDbTables_(db_cards, 'cards');
  refreshCardName_('delete', pos);
  refreshCardsRules_();
}

function getCardsBalances_ () {
  const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('_Backstage');
  let data, code;
  let v, i, k;

  if (!sheet) return;

  const h_ = TABLE_DIMENSION.height;
  const w_ = TABLE_DIMENSION.width;

  const num_acc = getConstProperties_('number_accounts');
  const db_cards = getDbTables_('cards');

  const col = 2 + w_ + w_ * num_acc;
  const num_cards = db_cards.count;

  if (db_cards.count === 0) return;

  const balances = {
    cards: ['All'],
    balance: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
  };

  data = sheet.getRange(1, col, 1 + 12 * h_, w_).getValues();
  for (i = 0; i < 12; i++) {
    balances.balance[0][i] = data[5 + h_ * i][0];
  }

  data = sheet.getRange(1, col + w_, 1 + 12 * h_, w_ * num_cards).getValues();

  for (k = 0; k < num_cards; k++) {
    if (data[0][w_ * k] === '') continue;

    code = data[0][w_ * k].match(/\w+/g);
    if (code == null) continue;

    for (i = 0; i < code.length; i++) {
      if (db_cards.codes.indexOf(code[i]) !== -1) break;
    }
    if (i === code.length) continue;

    balances.cards.push(code[i]);

    v = [];
    for (i = 0; i < 12; i++) {
      v[i] = data[5 + h_ * i][w_ * k];
    }

    balances.balance.push(v);
  }

  return balances;
}

function refreshCardName_ (action, index, card) {
  const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('_Backstage');
  let text, limit, i;

  if (!sheet) return;

  const h_ = TABLE_DIMENSION.height;
  const w_ = TABLE_DIMENSION.width;

  const num_acc = getConstProperties_('number_accounts');

  const col = 2 + w_ + w_ * num_acc + w_ + 1;

  const ranges = [];
  for (i = 0; i < 12; i++) {
    ranges[i] = rollA1Notation(2 + h_ * i, col + w_ * index);
  }

  if (action === 'set') {
    limit = '=' + FormatNumber.localeSignal(card.limit);
    text = '^' + card.code + '$';
    for (i = 0; i < card.aliases.length; i++) {
      text += '|^' + card.aliases[i] + '$';
    }
  } else if (action === 'delete') {
    text = '';
    limit = '';
  }

  sheet.getRange(1, col + w_ * index - 1).setValue(text);
  sheet.getRangeList(ranges).setValue(limit);

  {
    const db_cards = getDbTables_('cards');
    const metadata = [];

    for (let k = 0; k < db_cards.data.length; k++) {
      metadata[k] = {};
      Object.assign(metadata[k], db_cards.data[k]);
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
}

function refreshCardsRules_ () {
  const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('Cards');
  let card;
  let i, j;

  if (!sheet) return;

  const h_ = TABLE_DIMENSION.height;
  const w_ = TABLE_DIMENSION.width;

  const num_acc = getConstProperties_('number_accounts');
  const db_cards = getDbTables_('cards');

  const list1 = ['All'];
  const list2 = [];

  for (i = 0; i < db_cards.count; i++) {
    card = db_cards.data[i];

    list1.push(card.code);
    list2.push(card.code);

    for (j = 0; j < card.aliases.length; j++) {
      list2.push(card.aliases[j]);
    }
  }

  const n = sheet.getMaxRows() - 5;
  if (n < 1) return;

  if (list2.length === 0) {
    const rangeOff1 = sheet.getRange(2, 2);
    const rangeOff2 = sheet.getRange(6, 3, n, 1);

    for (i = 0; i < 12; i++) {
      rangeOff1.offset(0, 6 * i).clearDataValidations();
      rangeOff2.offset(0, 6 * i).clearDataValidations();
    }
    SpreadsheetApp.flush();
    return;
  }

  const rule1 = SpreadsheetApp.newDataValidation()
    .requireValueInList(list1, true)
    .setAllowInvalid(true)
    .build();

  const rule2 = SpreadsheetApp.newDataValidation()
    .requireValueInList(list2, true)
    .setAllowInvalid(true)
    .build();

  {
    const rangeOff1 = sheet.getRange(2, 2);
    const rangeOff2 = sheet.getRange(6, 3, n, 1);

    for (i = 0; i < 12; i++) {
      rangeOff1.offset(0, 6 * i)
        .clearDataValidations()
        .setDataValidation(rule1);

      rangeOff2.offset(0, 6 * i)
        .clearDataValidations()
        .setDataValidation(rule2);
    }
  }

  SpreadsheetApp.flush();
}
