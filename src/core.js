/** @NotOnlyCurrentDoc */

/**
 * Runs when the add-on is installed; calls onOpen() to ensure menu creation and
 * any other initializion work is done immediately.
 *
 * @param {Object} e The event parameter for a simple onInstall trigger.
 */
function onInstall (e) {
  onOpen(e);
  setUserId_();
}

/**
  * Adds a custom menu with items to show the sidebar and dialog.
  *
  * @param {Object} e The event parameter for a simple onOpen trigger.
  */
function onOpen (e) {
  const ui = SpreadsheetApp2.getUi();
  const menu = ui.createAddonMenu();

  if (e && e.authMode === ScriptApp.AuthMode.NONE) {
    menu.addItem('Start budget sheet', 'showDialogSetupAddon_')
      .addSeparator()
      .addItem('About the add-on', 'showDialogAboutAddon');
  } else {
    if (isInstalled_()) {
      menu.addItem('Add blank rows', 'toolAddBlankRows')
        .addItem('Format table', 'toolFormatRegistry')
        .addItem('Update cash flow', 'toolUpdateCashFlow');

      if (hasCards_()) menu.addItem('Forward installments', 'toolForwardInstallments');

      menu.addSeparator()
        .addSubMenu(ui.createMenu('Open panel')
          .addItem('Accounts & Cards', 'showPanelTables')
          .addItem('BnS Gallery', 'showPanelAnalytics'))
        .addSubMenu(ui.createMenu('Pages view')
          .addItem('Collapse', 'toolHideSheets_')
          .addItem('Expand', 'toolShowSheets_'))
        .addSeparator()
        .addItem('Change settings', 'showSidebarSettings')
        .addSubMenu(ui.createMenu('More')
          .addItem('About the add-on', 'showDialogAboutAddon')
          .addItem('Show Quickstart', 'showPanelQuickstart')
          .addSeparator()
          .addItem('Deactive the add-on', 'askDeactivation'));
    } else {
      menu.addItem('Start budget sheet', 'showDialogSetupAddon_')
        .addSeparator()
        .addItem('About the add-on', 'showDialogAboutAddon');
    }
  }

  menu.addToUi();
}

function printHrefScriptlets (htmlTemplate) {
  for (const key in RESERVED_HREF) {
    htmlTemplate[key] = RESERVED_HREF[key];
  }
  return htmlTemplate;
}

function showPanelQuickstart () {
  let htmlTemplate = HtmlService.createTemplateFromFile('quickstart/htmlQuickstart');
  htmlTemplate = printHrefScriptlets(htmlTemplate);

  const dec_p = getSpreadsheetSettings_('decimal_separator');
  const financial_year = getConstProperties_('financial_year');

  if (dec_p) {
    htmlTemplate.dec_p = '.';
    htmlTemplate.dec_n = 'dot';
  } else {
    htmlTemplate.dec_p = ',';
    htmlTemplate.dec_n = 'comma';
  }

  htmlTemplate.isCurrent = (DATE_NOW < new Date(financial_year, 11, 1));

  const htmlSidebar = htmlTemplate.evaluate().setTitle('Quickstart');
  SpreadsheetApp2.getUi().showSidebar(htmlSidebar);
}

function showPanelTables (tab) {
  if (onlineUpdate_()) return;

  let htmlTemplate = HtmlService.createTemplateFromFile('tables/htmlSidebarTables');
  htmlTemplate = printHrefScriptlets(htmlTemplate);

  const dec_s = getSpreadsheetSettings_('decimal_separator');

  if (dec_s) {
    htmlTemplate.dec_s = '.';
    htmlTemplate.dec_t = ',';
  } else {
    htmlTemplate.dec_s = ',';
    htmlTemplate.dec_t = '.';
  }

  htmlTemplate.decimal_places = getSpreadsheetSettings_('decimal_places');

  if (tab) {
    htmlTemplate.tab_acc = '';
    htmlTemplate.tab_cards = 'active';
  } else {
    htmlTemplate.tab_acc = 'active';
    htmlTemplate.tab_cards = '';
  }

  const htmlSidebar = htmlTemplate.evaluate().setTitle('Accounts & Cards');
  SpreadsheetApp2.getUi().showSidebar(htmlSidebar);
}

function showPanelAnalytics () {
  if (onlineUpdate_()) return;

  let htmlTemplate = HtmlService.createTemplateFromFile('cool_gallery/htmlCoolGallery');
  htmlTemplate = printHrefScriptlets(htmlTemplate);

  const htmlSidebar = htmlTemplate.evaluate().setTitle('BnS Gallery');
  SpreadsheetApp2.getUi().showSidebar(htmlSidebar);
}

function showSidebarSettings () {
  if (!isUserAdmin_()) {
    SpreadsheetApp2.getUi().alert(
      'Permission denied',
      "You don't have permission to change the settings.",
      SpreadsheetApp2.getUi().ButtonSet.OK);
    return;
  }

  if (onlineUpdate_()) return;

  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  const financial_year = getConstProperties_('financial_year');
  const isOperationActive = (financial_year >= DATE_NOW.getFullYear());

  let htmlTemplate = HtmlService.createTemplateFromFile('settings/sidebar/htmlSidebar');
  htmlTemplate = printHrefScriptlets(htmlTemplate);
  htmlTemplate.settings_backup = getFeatureFlagStatus_('settings/backup');

  const owner = spreadsheet.getOwner();
  if (owner) {
    htmlTemplate.isOwner = (Session.getEffectiveUser().getEmail() === owner.getEmail());
    htmlTemplate.isSharedDrive = false;
  } else {
    htmlTemplate.isOwner = false;
    htmlTemplate.isSharedDrive = true;
  }

  htmlTemplate.isOperationActive = isOperationActive;

  if (isOperationActive) {
    const calendars = getAllOwnedCalendars();
    htmlTemplate.isCalendarEnabled = (calendars.md5.length > 0);
    htmlTemplate.calendars_data = calendars;
  } else {
    htmlTemplate.isCalendarEnabled = false;
  }

  htmlTemplate.doc_name = spreadsheet.getName();
  htmlTemplate.financial_year = financial_year;

  const htmlSidebar = htmlTemplate.evaluate().setTitle('Settings');

  SpreadsheetApp2.getUi().showSidebar(htmlSidebar);
}

function showDialogAboutAddon () {
  let htmlTemplate;
  let v0;

  if (isInstalled_()) v0 = getClassVersion_('script');
  else v0 = APPS_SCRIPT_GLOBAL.script_version;

  htmlTemplate = HtmlService.createTemplateFromFile('html/htmlAboutAddon');
  htmlTemplate = printHrefScriptlets(htmlTemplate);

  htmlTemplate.version = v0.major + '.' + v0.minor + '.' + v0.patch;

  const htmlDialog = htmlTemplate.evaluate()
    .setWidth(281)
    .setHeight(373);

  SpreadsheetApp2.getUi().showModalDialog(htmlDialog, 'About the add-on');
}

function showDialogErrorMessage () {
  let htmlTemplate;

  htmlTemplate = HtmlService.createTemplateFromFile('html/htmlExceptionMessage');
  htmlTemplate = printHrefScriptlets(htmlTemplate);

  const htmlDialog = htmlTemplate.evaluate()
    .setWidth(373)
    .setHeight(137);

  SpreadsheetApp2.getUi().showModalDialog(htmlDialog, 'Something went wrong');
}

function showDialogMessage (title, message, timeout) {
  let htmlTemplate;

  htmlTemplate = HtmlService.createTemplateFromFile('html/htmlMessageScreen');
  htmlTemplate = printHrefScriptlets(htmlTemplate);

  htmlTemplate.message = message;
  htmlTemplate.hasTimeout = timeout;

  const htmlDialog = htmlTemplate.evaluate()
    .setWidth(263)
    .setHeight(113);

  SpreadsheetApp2.getUi().showModalDialog(htmlDialog, title);
}

function showDialogSetupAddon_ () {
  setUserId_();
  if (conditionalInstallTest_()) return;

  let htmlTemplate = HtmlService.createTemplateFromFile('setup/htmlSetupAddon');
  htmlTemplate = printHrefScriptlets(htmlTemplate);

  htmlTemplate.setup_restore = getFeatureFlagStatus_('setup/restore');
  htmlTemplate.setup_copy = getFeatureFlagStatus_('setup/copy');

  const uuid = Utilities.getUuid();
  CacheService2.put('user', uuid, 'boolean', true);

  htmlTemplate.uuid = uuid;

  const htmlDialog = htmlTemplate.evaluate()
    .setWidth(353)
    .setHeight(359);

  SpreadsheetApp2.getUi().showModalDialog(htmlDialog, 'Start budget spreadsheet');
}

function showDialogSetupRestore (uuid, msg) {
  let htmlTemplate = HtmlService.createTemplateFromFile('setup/restore/htmlSetupRestore');
  htmlTemplate = printHrefScriptlets(htmlTemplate);

  htmlTemplate.isValid = msg === '';
  htmlTemplate.msg = msg || '';
  htmlTemplate.uuid = uuid;

  const htmlDialog = htmlTemplate.evaluate()
    .setWidth(353)
    .setHeight(359);

  SpreadsheetApp2.getUi().showModalDialog(htmlDialog, 'Restore from backup');
}

function showDialogSetupCopy (uuid, msg) {
  let htmlTemplate = HtmlService.createTemplateFromFile('setup/restore/htmlSetupCopy');
  htmlTemplate = printHrefScriptlets(htmlTemplate);

  htmlTemplate.isValid = msg === '';
  htmlTemplate.msg = msg || '';
  htmlTemplate.uuid = uuid;

  const htmlDialog = htmlTemplate.evaluate()
    .setWidth(353)
    .setHeight(359);

  SpreadsheetApp2.getUi().showModalDialog(htmlDialog, 'Copy from spreadsheet');
}

function showDialogPickerRestore (uuid, topic) {
  if (!CacheService2.get('user', uuid, 'boolean')) {
    showSessionExpired();
    return;
  }

  const isRestore = (topic === 'restore');
  const title = (isRestore ? 'Select backup' : 'Select spreadsheet');

  const developer_key = getDeveloperKey_();
  if (developer_key === 1) showDialogErrorMessage();

  const htmlTemplate = HtmlService.createTemplateFromFile('setup/restore/htmlPickerRestore');
  htmlTemplate.picker_key = developer_key;
  htmlTemplate.isRestore = isRestore;
  htmlTemplate.uuid = uuid;

  const htmlDialog = htmlTemplate.evaluate()
    .setWidth(617)
    .setHeight(487);

  SpreadsheetApp2.getUi().showModalDialog(htmlDialog, title);
}

function showDialogSetupEnd () {
  let htmlTemplate;

  htmlTemplate = HtmlService.createTemplateFromFile('setup/htmlSetupEnd');
  htmlTemplate = printHrefScriptlets(htmlTemplate);

  const htmlDialog = htmlTemplate.evaluate()
    .setWidth(353)
    .setHeight(367);

  SpreadsheetApp2.getUi().showModalDialog(htmlDialog, 'Add-on Budget n Sheets');
}

function showSessionExpired () {
  const ui = SpreadsheetApp2.getUi();

  ui.alert(
    'Session expired',
    'Your session timed out. Please try again.',
    ui.ButtonSet.OK);
}

function showDialogEditAccount (acc_id) {
  const htmlTemplate = HtmlService.createTemplateFromFile('tables/htmlEditAccount');

  const decimal_places = getSpreadsheetSettings_('decimal_places');
  const account = tablesService('get', 'account', acc_id);
  if (!account) return 1;

  for (const key in account) {
    htmlTemplate['acc_' + key] = account[key];
  }

  htmlTemplate.step = (decimal_places > 0 ? '0.' + '0'.repeat(decimal_places - 1) + '1' : '1');
  htmlTemplate.placeholder = (decimal_places > 0 ? '0.' + '0'.repeat(decimal_places) : '0');

  const htmlDialog = htmlTemplate.evaluate()
    .setWidth(300)
    .setHeight(359);

  SpreadsheetApp2.getUi().showModalDialog(htmlDialog, 'Edit Account');
}

function showDialogAddCard () {
  const htmlTemplate = HtmlService.createTemplateFromFile('tables/htmlAddEditCard');

  const decimal_places = getSpreadsheetSettings_('decimal_places');

  htmlTemplate.is_edit = false;
  htmlTemplate.step = (decimal_places > 0 ? '0.' + '0'.repeat(decimal_places - 1) + '1' : '1');
  htmlTemplate.placeholder = (decimal_places > 0 ? '0.' + '0'.repeat(decimal_places) : '0');

  const card = { id: '', name: '', code: '', aliases: '', limit: 0 };

  for (const key in card) {
    htmlTemplate['card_' + key] = card[key];
  }

  const htmlDialog = htmlTemplate.evaluate()
    .setWidth(300)
    .setHeight(359);

  SpreadsheetApp2.getUi().showModalDialog(htmlDialog, 'Add Card');
}

function showDialogEditCard (card_id) {
  const htmlTemplate = HtmlService.createTemplateFromFile('tables/htmlAddEditCard');

  const decimal_places = getSpreadsheetSettings_('decimal_places');

  htmlTemplate.is_edit = true;
  htmlTemplate.step = (decimal_places > 0 ? '0.' + '0'.repeat(decimal_places - 1) + '1' : '1');
  htmlTemplate.placeholder = (decimal_places > 0 ? '0.' + '0'.repeat(decimal_places) : '0');

  const card = tablesService('get', 'card', card_id);
  if (!card) return 1;

  card.aliases = card.aliases.join(', ');

  for (const key in card) {
    htmlTemplate['card_' + key] = card[key];
  }

  const htmlDialog = htmlTemplate.evaluate()
    .setWidth(300)
    .setHeight(359);

  SpreadsheetApp2.getUi().showModalDialog(htmlDialog, 'Edit Card');
}

function showDialogDeleteCard (card_id) {
  const card = tablesService('get', 'card', card_id);
  if (!card) return 1;

  const ui = SpreadsheetApp2.getUi();
  const response = ui.alert(
    'Delete card',
    'Are you sure you want to delete ' + card.name + '?',
    ui.ButtonSet.YES_NO);

  if (response === ui.Button.YES) {
    tablesService('set', 'deletecard', card_id);
    return 1;
  }
}
