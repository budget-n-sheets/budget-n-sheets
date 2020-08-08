function backupRequest () {
  if (!isInstalled_()) return;
  if (isScriptUpToDate_() !== 1) return;
  if (getUserId_() === classAdminSettings_("get", "admin_id")) return;

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const backup = {
    backup: {},
    ttt: {
      0: {}, 1: {}, 2: {}, 3: {},
      4: {}, 5: {}, 6: {}, 7: {},
      8: {}, 9: {}, 10: {}, 11: {}
    },
    cards: {
      0: [], 1: [], 2: [], 3: [],
      4: [], 5: [], 6: [], 7: [],
      8: [], 9: [], 10: [], 11: []
    },
    tags: [],
    db_tables: {
      accounts: {},
      cards: {}
    },
    admin_settings: {},
    user_settings: {},
    const_properties: {}
  };

  backupMonths_(backup, spreadsheet);
  backupCards_(backup, spreadsheet);
  backupTags_(backup, spreadsheet);
  backupTables_(backup);
  backupProperties_(backup);

  backupMeta_(backup, spreadsheet);

  const blob = digestBackup_(backup);
  emailBackup_(blob);
}

function emailBackup_ (blob) {
  if (MailApp.getRemainingDailyQuota() === 0) return;
}

function digestBackup_ (backup) {
  const string = JSON.stringify(backup);
  const webSafeCode = Utilities.base64EncodeWebSafe(string, Utilities.Charset.UTF_8);

  const sha = computeDigest('SHA_1', webSafeCode, 'UTF_8');
  const data = webSafeCode + ':' + sha;

  const date = Utilities.formatDate(DATE_NOW, 'GMT', 'yyyy-MM-dd-HH-mm-ss');
  const name = 'budget-n-sheets-' + date + '.backup';
  const blob = Utilities.newBlob(data, 'text/plain', name);

  return blob;
}

function backupMeta_ (backup, spreadsheet) {
  backup.backup = {
    version: 1,
    date_request: DATE_NOW.getTime()
  };

  const digest = computeDigest('SHA_256', spreadsheet.getId(), 'UTF_8');
  backup.backup.sha256_spreadsheet_id = digest;
}

function backupProperties_ (backup) {
  backup.user_settings = PropertiesService2.getProperty('document', 'user_settings', 'json');
  backup.admin_settings = PropertiesService2.getProperty('document', 'admin_settings', 'json');
  backup.const_properties = PropertiesService2.getProperty('document', 'const_properties', 'json');

  const digest = computeDigest('SHA_256', backup.user_settings.financial_calendar, 'UTF_8');
  backup.user_settings.sha256_financial_calendar = digest;

  delete backup.user_settings.financial_calendar;
  delete backup.admin_settings.admin_id;
  delete backup.const_properties.date_created;
}

function backupTables_ (backup) {
  const db_tables = getDbTables_();
  var account, card, i;

  i = -1;
  while (++i < db_tables.accounts.data.length) {
    account = db_tables.accounts.data[i];
    backup.db_tables.accounts[i] = {
      name: account.name,
      balance: account.balance,
      time_a: account.time_a,
      time_z: account.time_z
    };
  }

  i = -1;
  while (++i < db_tables.cards.data.length) {
    card = db_tables.cards.data[i];
    backup.db_tables.cards[i] = {
      name: card.name,
      code: card.code,
      limit: card.limit,
      aliases: card.aliases
    };
  }
}

function backupTags_ (backup, spreadsheet) {
  const sheet = spreadsheet.getSheetByName('Tags');
  var table, j;

  if (!sheet) return;

  const max = sheet.getMaxRows() - 1;
  if (max < 1) return;
  table = sheet.getRange(2, 1, max, 5).getValues();

  j = max;
  while (--j > -1) {
    if (table[j][0] !== '' || table[j][2] !== '' || table[j][4] !== '') break;
  }
  j++;

  if (j > 0) {
    backup.tags = sheet.getRange(2, 1, j, 5).getValues();
  }
}

function backupCards_ (backup, spreadsheet) {
  const sheet = spreadsheet.getSheetByName('Cards');
  var table, i, j;

  if (!sheet) return;

  const max = sheet.getMaxRows() - 5;
  if (max < 1) return;
  table = sheet.getRange(6, 1, max, 6 * 12).getValues();

  i = -1;
  while (++i < 12) {
    j = max;
    while (--j > -1) {
      if (table[j][0 + 6 * i] !== '' || table[j][1 + 6 * i] !== '' || table[j][2 + 6 * i] !== '' ||
          table[j][3 + 6 * i] !== '' || table[j][4 + 6 * i] !== '') break;
    }
    j++;

    if (j > 0) {
      backup.cards[i] = sheet.getRange(6, 1 + 6 * i, j, 5).getValues();
    }
  }
}

function backupMonths_ (backup, spreadsheet) {
  const num_acc = getConstProperties_('number_accounts') + 1;
  var sheet, table, max, i, j, k;

  i = -1;
  while (++i < 12) {
    sheet = spreadsheet.getSheetByName(MN_SHORT[i]);
    if (!sheet) continue;

    max = sheet.getLastRow();
    if (max < 5) continue;
    max -= 4;

    k = -1;
    while (++k < num_acc) {
      backup.ttt[i][k] = [];
      table = sheet.getRange(5, 1 + 5 * k, max, 4).getValues();

      j = max;
      while (--j > -1) {
        if (table[j][0] !== '' || table[j][1] !== '' ||
            table[j][2] !== '' || table[j][3] !== '') break;
      }
      j++;

      if (j > 0) {
        backup.ttt[i][k] = table.slice(0, j);
      }
    }
  }
}
