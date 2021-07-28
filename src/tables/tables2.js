function getDbTables_ (select) {
  const db_tables = CachedAccess.get('DB_TABLES');

  if (select) return db_tables[select];
  return db_tables;
}

function setDbTables_ (db, select) {
  let db_tables;

  if (select) {
    db_tables = PropertiesService2.getProperty('document', 'DB_TABLES', 'json');
    db_tables[select] = db;
  } else {
    db_tables = db;
  }

  CachedAccess.update('DB_TABLES', db_tables);
}

function tablesService (action, select, param) {
  const lock = LockService.getDocumentLock();
  try {
    lock.waitLock(2000);
  } catch (err) {
    console.warn(err);
    return 1;
  }

  switch (action) {
    case 'get':
      return getTablesService_(select, param);
    case 'set':
      return setTablesService_(select, param);
    case 'refresh':
      return refreshTablesService_(select, param);

    default:
      console.error('tablesService(): Switch case is default.', { action: action });
      return 1;
  }
}

function getTablesService_ (select, param) {
  switch (select) {
    case 'all':
      return getTables_();
    case 'accounts':
    case 'cards':
      return getSelectedData_(select);
    case 'account':
      return getAccountById_(param);
    case 'card':
      return getCardById_(param);
    case 'cardsbalances':
      return getCardsBalances_();
    case 'uniqueid':
      return genUniqueTableId_();

    default:
      console.error('getTablesService_(): Switch case is default.', { select: select });
      return 1;
  }
}

function setTablesService_ (select, param) {
  switch (select) {
    case 'account':
      return setAccount_(param);
    case 'addcard':
      return addCard_(param);
    case 'setcard':
      return setCard_(param);
    case 'deletecard':
      return deleteCard_(param);

    default:
      console.error('setTablesService_(): Switch case is default.', { select: select });
      return 1;
  }
}

function refreshTablesService_ (select, param) {
  switch (select) {
    case 'accountname':
      return refreshAccountName_(param);
    case 'cashflow':
      return refreshCashFlowReferences_();
    case 'cardname':
      return refreshCardName_();
    case 'cardsrules':
      return refreshCardsRules_();

    default:
      console.error('refreshTablesService_(): Switch case is default.', { select: select });
      return 1;
  }
}

function getTables_ () {
  const db_tables = getDbTables_();
  const db = {
    accounts: db_tables.accounts.data,
    cards: db_tables.cards.data
  };
  return db;
}

function getSelectedData_ (select) {
  const db = getDbTables_(select);
  return db.data;
}

function getAccountById_ (acc_id) {
  const db_accounts = getDbTables_('accounts');
  const c = db_accounts.ids.indexOf(acc_id);
  if (c !== -1) return db_accounts.data[c];
}

function setAccount_ (account) {
  account.name = account.name.trim();
  if (account.names === '') throw new Error('Invalid account name.');

  const db_accounts = getDbTables_('accounts');

  const c = db_accounts.ids.indexOf(account.id);
  if (c === -1) return 1;

  prev_time_a = account.time_a;

  account.time_a = Number(account.time_a);
  account.balance = Number(account.balance);

  db_accounts.names[c] = account.name;

  db_accounts.data[c].name = account.name;
  db_accounts.data[c].time_a = account.time_a;
  db_accounts.data[c].balance = account.balance;

  setDbTables_(db_accounts, 'accounts');

  refreshAccountName_(c, account);
  refreshCashFlowReferences_();
}

function refreshAccountName_ (index, account) {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName('_Backstage');
  let i;

  if (!sheet) return 1;

  const h_ = TABLE_DIMENSION.height;
  const w_ = TABLE_DIMENSION.width;

  const list = [];
  const col = 2 + w_ + w_ * index;

  for (i = 1; i < 12; i++) {
    list[i - 1] = rollA1Notation(2 + h_ * i, col);
  }

  {
    const rangeOff = sheet.getRange(1, col);

    rangeOff.offset(1, 0).setFormula('0');
    sheet.getRangeList(list).setFormulaR1C1('R[-' + (h_ - 1) + ']C');

    rangeOff.setValue(account.name);
    rangeOff.offset(1 + h_ * account.time_a, 0).setFormula('=' + FormatNumber.localeSignal(account.balance));
  }

  sheet = spreadsheet.getSheetByName('Jan');
  if (sheet) {
    sheet.getRange(1, 6 + 5 * index).setValue(account.name);
  }

  {
    const db_accounts = getDbTables_('accounts');
    const metadata = [];

    for (let k = 0; k < db_accounts.data.length; k++) {
      metadata[k] = {};
      Object.assign(metadata[k], db_accounts.data[k]);
      delete metadata[k].id;
    }

    const list_metadata = sheet.createDeveloperMetadataFinder()
      .withVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
      .withKey('db_accounts')
      .find();

    if (list_metadata.length > 0) {
      list_metadata[0].setValue(JSON.stringify(metadata));
    } else {
      sheet.addDeveloperMetadata(
        'db_accounts',
        JSON.stringify(metadata),
        SpreadsheetApp.DeveloperMetadataVisibility.PROJECT
      );
    }
  }
}

function refreshCashFlowReferences_ () {
  const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('Cash Flow');
  let string, mm, dd, i, k;

  if (!sheet) return 1;

  const h_ = TABLE_DIMENSION.height;

  const ranges = ['G', 'L', 'Q', 'V', 'AA'];

  const num_acc = SettingsConst.getValueOf('number_accounts');
  const yyyy = SettingsConst.getValueOf('financial_year');

  const db_accounts = getDbTables_('accounts');

  const formulas = ['=0 + B4'];

  for (i = 1; i < 12; i++) {
    dd = new Date(yyyy, i, 0).getDate();
    formulas[i] = '=' + rollA1Notation(3 + dd, 4 * i - 1) + ' + ' + rollA1Notation(4, 2 + 4 * i);
  }

  for (k = 0; k < num_acc; k++) {
    mm = db_accounts.data[k].time_a;
    formulas[mm] += ' + _Backstage!' + ranges[k] + (2 + h_ * mm);
  }

  {
    const rangeOff = sheet.getRange(4, 3);

    for (i = 0; i < 12; i++) {
      rangeOff.offset(0, 4 * i).setFormula(formulas[i]);
    }
  }
}

function genUniqueTableId_ () {
  const db_acc = getDbTables_('accounts');
  const db_cards = getDbTables_('cards');

  const ids = db_acc.ids.concat(db_cards.ids);
  let i = 0;
  let random = '';

  do {
    random = randomString(7, 'lonum');
    i++;
  } while (ids.indexOf(random) !== -1 && i < 99);
  if (i < 99) return random;
}
