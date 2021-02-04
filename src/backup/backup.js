function requestBackupSession () {
  console.info('sidebar/Settings/Backup/Back up now');

  if (!isInstalled_()) return 2;
  if (!isUserAdmin_()) return 2;
  if (isScriptUpToDate_() !== 1) return 2;

  const ui = SpreadsheetApp.getUi();

  if (MailApp.getRemainingDailyQuota() === 0) {
    ui.alert(
      "Can't back up",
      "You don't have enought quota for Google Services. Try again later.",
      ui.ButtonSet.OK);
    return 1;
  }

  let htmlTemplate = HtmlService.createTemplateFromFile('backup/htmlNewPassphrase');
  htmlTemplate = printHrefScriptlets(htmlTemplate);

  const htmlDialog = htmlTemplate.evaluate()
    .setWidth(281)
    .setHeight(443);

  ui.showModalDialog(htmlDialog, 'Enter passphrase');
}

function backupRequestUi (passphrase) {
  if (!getFeatureFlagStatus_('settings/backup')) return 2;
  if (!isInstalled_()) return 2;
  if (!isUserAdmin_()) return 2;
  if (isScriptUpToDate_() !== 1) return 2;
  if (testPassphrasePolicy(passphrase)) return 1;

  const ui = SpreadsheetApp.getUi();

  showDialogMessage('Add-on backup', 'Backing up...', 1);
  backupRequest_(passphrase);

  ui.alert(
    'Add-on backup',
    'The backup was completed successfully.',
    ui.ButtonSet.OK);
  return 0;
}

function testPassphrasePolicy (passphrase) {
  if (typeof passphrase !== 'string') return true;
  if (passphrase.length < 12) return true;
  if (!/[a-z]+/.test(passphrase)) return true;
  if (!/[A-Z]+/.test(passphrase)) return true;
  if (!/[0-9]+/.test(passphrase)) return true;
  if (!/[~!@#$%\^*\-_=+[{\]}/;:,.?]+/.test(passphrase)) return true;
  if (!/^[ 0-9a-zA-Z~!@#$%\^*\-_=+[{\]}/;:,.?]{12,}$/.test(passphrase)) return true;

  return false;
}

function backupRequest_ (passphrase) {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  const backup = {
    backup: {},
    ttt: {
      0: {},
      1: {},
      2: {},
      3: {},
      4: {},
      5: {},
      6: {},
      7: {},
      8: {},
      9: {},
      10: {},
      11: {}
    },
    cards: {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: [],
      10: [],
      11: []
    },
    tags: [],
    db_tables: {
      accounts: {},
      cards: {}
    },
    admin_settings: {},
    user_settings: {},
    spreadsheet_settings: {},
    const_properties: {},
    class_version2: {}
  };

  backupMonths_(backup);
  backupCards_(backup);
  backupTags_(backup);
  backupTables_(backup);
  backupProperties_(backup);

  backupMeta_(backup);

  const blob = encryptBackup_(backup, passphrase);
  if (blob === 1) throw new Error('encryptBackup_(): Backup encryption failed.');

  emailBackup_(blob);
  console.info('backup/success');
}

function emailBackup_ (blob) {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();

  let htmlTemplate = HtmlService.createTemplateFromFile('backup/htmlBackupEmail');
  htmlTemplate = printHrefScriptlets(htmlTemplate);

  htmlTemplate.spreadsheet_url = spreadsheet.getUrl();
  htmlTemplate.spreadsheet_name = spreadsheet.getName();
  htmlTemplate.time = DATE_NOW;

  const htmlMessage = htmlTemplate.evaluate();
  MailApp.sendEmail(
    Session.getEffectiveUser().getEmail(),
    'Your Budget n Sheets Backup',
    htmlMessage.getContent(),
    {
      name: 'Add-on Budget n Sheets',
      htmlBody: htmlMessage.getContent(),
      noReply: true,
      attachments: [blob]
    }
  );
}

function encryptBackup_ (backup, passphrase) {
  const stringify = JSON.stringify(backup);

  const date = Utilities.formatDate(DATE_NOW, 'GMT', 'yyyy-MM-dd-HH-mm-ss');
  const name = 'budget-n-sheets-' + date + '.backup';

  const options = {
    mode: 'gcm',
    iter: 1010010,
    ts: 128,
    adata: name
  };

  let encrypted;
  try {
    encrypted = sjcl.encrypt(passphrase, stringify, options);
  } catch (err) {
    ConsoleLog.error(err);
    return 1;
  }

  const webSafe = Utilities.base64EncodeWebSafe(encrypted, Utilities.Charset.UTF_8);
  const blob = Utilities.newBlob(webSafe, 'application/octet-stream', name);

  return blob;
}

function backupMeta_ (backup) {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();

  backup.backup = {
    version: APPS_SCRIPT_GLOBAL.backup_version,
    date_request: DATE_NOW.getTime(),
    spreadsheet_id: spreadsheet.getId(),
    spreadsheet_title: spreadsheet.getName()
  };
}

function backupProperties_ (backup) {
  backup.user_settings = PropertiesService2.getProperty('document', 'user_settings', 'json');
  backup.admin_settings = PropertiesService2.getProperty('document', 'admin_settings', 'json');
  backup.const_properties = PropertiesService2.getProperty('document', 'const_properties', 'json');
  backup.class_version2 = PropertiesService2.getProperty('document', 'class_version2', 'json');

  backup.spreadsheet_settings = {
    decimal_places: getSpreadsheetSettings_('decimal_places')
  };

  if (backup.user_settings.financial_calendar) {
    const digest = computeDigest('SHA_256', backup.user_settings.financial_calendar, 'UTF_8');
    backup.user_settings.sha256_financial_calendar = digest;
  } else {
    backup.user_settings.sha256_financial_calendar = '';
  }

  delete backup.user_settings.financial_calendar;
  delete backup.admin_settings.admin_id;
  delete backup.const_properties.date_created;
}

function backupTables_ (backup) {
  const db_tables = getDbTables_();
  let account, card, i;

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

function backupTags_ (backup) {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('Tags');
  let j;

  if (!sheet) return;

  const max = sheet.getLastRow() - 1;
  if (max < 1) return;
  const table = sheet.getRange(2, 1, max, 5).getValues();

  j = max;
  while (--j > -1) {
    if (table[j][0] !== '' || table[j][2] !== '' || table[j][4] !== '') break;
  }
  j++;

  if (j > 0) {
    backup.tags = sheet.getRange(2, 1, j, 5).getValues();
  }
}

function backupCards_ (backup) {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('Cards');
  let i, j;

  if (!sheet) return;

  const max = sheet.getLastRow() - 5;
  if (max < 1) return;
  const table = sheet.getRange(6, 1, max, 6 * 12).getValues();

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

function backupMonths_ (backup) {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  const num_acc = getConstProperties_('number_accounts') + 1;
  let sheet, table, max, i, j, k;

  i = -1;
  while (++i < 12) {
    sheet = spreadsheet.getSheetByName(MONTH_NAME.short[i]);
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
