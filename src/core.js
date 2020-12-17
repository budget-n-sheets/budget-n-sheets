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

  const installationSource = ScriptApp.getInstallationSource();

  switch (installationSource) {
    case ScriptApp.InstallationSource.NONE:
      console.info('purchase/NONE');
      break;
    case ScriptApp.InstallationSource.WEB_STORE_ADD_ON:
      console.info('purchase/WEB_STORE_ADD_ON');
      break;
    case ScriptApp.InstallationSource.APPS_MARKETPLACE_DOMAIN_ADD_ON:
      console.info('purchase/APPS_MARKETPLACE_DOMAIN_ADD_ON');
      break;
    default:
      console.info('purchase/DEAFULT');
      break;
  }
}

/**
	* Adds a custom menu with items to show the sidebar and dialog.
	*
	* @param {Object} e The event parameter for a simple onOpen trigger.
	*/
function onOpen (e) {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createAddonMenu();

  if (e && e.authMode == ScriptApp.AuthMode.NONE) {
    menu.addItem('Start budget sheet', 'showDialogSetupAddon_')
      .addSeparator()
      .addItem('About the add-on', 'showDialogAboutAddon');
  } else {
    if (isInstalled_()) {
      menu.addItem('Add blank rows', 'toolAddBlankRows')
        .addItem('Format table', 'toolFormatRegistry')
        .addItem('Update cash flow', 'toolUpdateCashFlow')
        .addSeparator()
        .addSubMenu(ui.createMenu('Open panel')
          .addItem('Accounts & Cards', 'showPanelTables')
          .addItem('Cool Gallery', 'showPanelAnalytics'))
        .addSubMenu(ui.createMenu('Pages view')
          .addItem('Collapse', 'toolHideSheets_')
          .addItem('Expand', 'toolShowSheets_'))
        .addItem('Toggle view mode', 'toggleViewMode_')
        .addSeparator()
        .addItem('Change settings', 'showSidebarMainSettings')
        .addSubMenu(ui.createMenu('More')
          .addItem('About the add-on', 'showDialogAboutAddon')
          .addItem('Deactive the add-on', 'askDeactivation')
          .addItem('Resume month', 'toolResumeActivity_')
          .addItem('Show Quickstart', 'showPanelQuickstart'));

      console.log('open');
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
  console.log('quickstart');

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
  SpreadsheetApp.getUi().showSidebar(htmlSidebar);
}

function showPanelTables (tab) {
  if (onlineUpdate_()) return;

  let htmlTemplate = HtmlService.createTemplateFromFile('html/htmlSidebarTables');
  htmlTemplate = printHrefScriptlets(htmlTemplate);

  const dec_p = getSpreadsheetSettings_('decimal_separator');

  if (dec_p) {
    htmlTemplate.dec_p = '.';
    htmlTemplate.dec_ps = ',';
  } else {
    htmlTemplate.dec_p = ',';
    htmlTemplate.dec_ps = '.';
  }

  if (tab) {
    htmlTemplate.tab_acc = '';
    htmlTemplate.tab_cards = 'active';
  } else {
    htmlTemplate.tab_acc = 'active';
    htmlTemplate.tab_cards = '';
  }

  const htmlSidebar = htmlTemplate.evaluate().setTitle('Accounts & Cards');
  SpreadsheetApp.getUi().showSidebar(htmlSidebar);
}

function showPanelAnalytics () {
  if (onlineUpdate_()) return;

  let htmlTemplate, htmlSidebar;

  htmlTemplate = HtmlService.createTemplateFromFile('cool_gallery/htmlCoolGallery');
  htmlTemplate = printHrefScriptlets(htmlTemplate);

  htmlTemplate.list = APPS_SCRIPT_GLOBAL.cool_gallery;

  htmlSidebar = htmlTemplate.evaluate().setTitle('Cool Gallery');

  SpreadsheetApp.getUi().showSidebar(htmlSidebar);
}

function showSidebarMainSettings () {
  if (onlineUpdate_()) return;

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let htmlTemplate, htmlSidebar;

  const isAdmin = isUserAdmin_();
  const financial_year = getConstProperties_('financial_year');
  const isOperationActive = (financial_year >= DATE_NOW.getFullYear());

  htmlTemplate = (isAdmin ? 'html/htmlAdminSettings' : 'html/htmlEditorSettings');
  htmlTemplate = HtmlService.createTemplateFromFile(htmlTemplate);
  htmlTemplate = printHrefScriptlets(htmlTemplate);

  htmlTemplate.isOperationActive = isOperationActive;

  if (isAdmin) {
    htmlTemplate.isSharedDrive = (spreadsheet.getOwner() == null);
    htmlTemplate.hasEditors = (spreadsheet.getEditors().length > 1);

    if (isOperationActive) {
      const calendars = getAllOwnedCalendars();
      htmlTemplate.isCalendarEnabled = (calendars.md5.length > 0);
      htmlTemplate.calendars_data = calendars;
    } else {
      htmlTemplate.isCalendarEnabled = false;
    }
  } else if (!getAdminSettings_('isChangeableByEditors')) {
    SpreadsheetApp.getUi().alert(
      'Permission denied',
      "You don't have permission to change the settings.",
      SpreadsheetApp.getUi().ButtonSet.OK);

    return;
  }

  htmlTemplate.doc_name = spreadsheet.getName();
  htmlTemplate.financial_year = financial_year;

  htmlSidebar = htmlTemplate.evaluate().setTitle('Settings');

  SpreadsheetApp.getUi().showSidebar(htmlSidebar);
}

function showDialogAboutAddon () {
  let htmlDialog, htmlTemplate;
  let v0;

  if (isInstalled_()) v0 = getClassVersion_('script');
  else v0 = APPS_SCRIPT_GLOBAL.script_version;

  htmlTemplate = HtmlService.createTemplateFromFile('html/htmlAboutAddon');
  htmlTemplate = printHrefScriptlets(htmlTemplate);

  htmlTemplate.version = v0.major + '.' + v0.minor + '.' + v0.patch;

  htmlDialog = htmlTemplate.evaluate()
    .setWidth(281)
    .setHeight(359);

  SpreadsheetApp.getUi().showModalDialog(htmlDialog, 'About the add-on');
}

function showDialogErrorMessage () {
  let htmlTemplate, htmlDialog;

  htmlTemplate = HtmlService.createTemplateFromFile('html/htmlExceptionMessage');
  htmlTemplate = printHrefScriptlets(htmlTemplate);

  htmlDialog = htmlTemplate.evaluate()
    .setWidth(373)
    .setHeight(137);

  SpreadsheetApp.getUi().showModalDialog(htmlDialog, 'Something went wrong');
}

function showDialogMessage (title, message, timeout) {
  let htmlTemplate, htmlDialog;

  htmlTemplate = HtmlService.createTemplateFromFile('html/htmlMessageScreen');
  htmlTemplate = printHrefScriptlets(htmlTemplate);

  htmlTemplate.message = message;
  htmlTemplate.hasTimeout = timeout;

  htmlDialog = htmlTemplate.evaluate()
    .setWidth(263)
    .setHeight(113);

  SpreadsheetApp.getUi().showModalDialog(htmlDialog, title);
}

function showDialogSetupAddon_ () {
  console.log('setup/intent');
  setUserId_();

  const ui = SpreadsheetApp.getUi();

  if (!isTemplateAvailable()) {
    ui.alert(
      'New version available',
      'Please, re-open the spreadsheet to update the add-on.',
      ui.ButtonSet.OK);
    return;
  } else if (isInstalled_()) {
    showDialogSetupEnd();
    onOpen();
    return;
  } else if (PropertiesService.getDocumentProperties().getProperty('lock_spreadsheet')) {
    ui.alert(
      "Can't create budget sheet",
      'The add-on was previously deactivated in this spreadsheet which is now locked.\nPlease start in a new spreadsheet.',
      ui.ButtonSet.OK);
    return;
  }

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let owner, user;

  owner = spreadsheet.getOwner();
  if (owner) owner = owner.getEmail();
  else owner = '';

  user = Session.getEffectiveUser().getEmail();

  if (owner && owner !== user) {
    ui.alert(
      'Permission denied',
      "You don't own the spreadsheet. Please start in a new spreadsheet.",
      ui.ButtonSet.OK);
    return;
  } else if (spreadsheet.getFormUrl()) {
    ui.alert(
      'Linked form',
      'The spreadsheet has a linked form. Please unlink the form first, or create a new spreadsheet.',
      ui.ButtonSet.OK);
    return;
  }

  ui.alert(
    'Notice',
    `Due to a bug with Google Sheets, if you experience
    any issues with the \"Start budget spreadsheet\" dialog,
    please use your browser in incognito/private mode
    and try again.

    Learn more at budgetnsheets.com/notice-to-x-frame`,
    ui.ButtonSet.OK);

  let htmlTemplate, htmlDialog;

  htmlTemplate = HtmlService.createTemplateFromFile('html/htmlSetupAddon');
  htmlTemplate = printHrefScriptlets(htmlTemplate);

  htmlDialog = htmlTemplate.evaluate()
    .setWidth(353)
    .setHeight(359);

  SpreadsheetApp.getUi().showModalDialog(htmlDialog, 'Start budget spreadsheet');
}

function showDialogSetupRestore (fileId) {
  if (isInstalled_()) return;

  let htmlTemplate = HtmlService.createTemplateFromFile('backup/htmlSetupRestore');
  htmlTemplate = printHrefScriptlets(htmlTemplate);

  htmlTemplate.hasFileId = (fileId != null);
  htmlTemplate.fileId = (fileId != null ? fileId : '');

  const htmlDialog = htmlTemplate.evaluate()
    .setWidth(353)
    .setHeight(359);

  SpreadsheetApp.getUi().showModalDialog(htmlDialog, 'Restore from backup');
}

function showDialogSetupCopy (fileId) {
  if (isInstalled_()) return;

  let htmlTemplate = HtmlService.createTemplateFromFile('backup/htmlSetupCopy');
  htmlTemplate = printHrefScriptlets(htmlTemplate);

  htmlTemplate.hasFileId = (fileId != null);
  htmlTemplate.fileId = (fileId != null ? fileId : '');

  const htmlDialog = htmlTemplate.evaluate()
    .setWidth(353)
    .setHeight(359);

  SpreadsheetApp.getUi().showModalDialog(htmlDialog, 'Copy from spreadsheet');
}

function showDialogPickerRestore (topic) {
  if (isInstalled_()) return;

  const isRestore = (topic === 'restore');
  const title = (isRestore ? 'Select backup' : 'Select spreadsheet');

  const developer_key = getDeveloperKey_();
  if (developer_key === 1) showDialogErrorMessage();

  const htmlTemplate = HtmlService.createTemplateFromFile('backup/htmlPickerRestore');
  htmlTemplate.picker_key = developer_key;
  htmlTemplate.isRestore = isRestore;

  const htmlDialog = htmlTemplate.evaluate()
    .setWidth(617)
    .setHeight(487);

  SpreadsheetApp.getUi().showModalDialog(htmlDialog, title);
}

function showDialogSetupEnd () {
  let htmlTemplate, htmlDialog;

  htmlTemplate = HtmlService.createTemplateFromFile('html/htmlSetupEnd');
  htmlTemplate = printHrefScriptlets(htmlTemplate);

  htmlDialog = htmlTemplate.evaluate()
    .setWidth(353)
    .setHeight(367);

  SpreadsheetApp.getUi().showModalDialog(htmlDialog, 'Add-on Budget n Sheets');
}

function showDialogEditAccount (acc_id) {
  const htmlTemplate = HtmlService.createTemplateFromFile('html/htmlEditAccount');
  let account;

  account = tablesService('get', 'account', acc_id);
  if (!account) return 1;

  for (const key in account) {
    htmlTemplate['acc_' + key] = account[key];
  }

  const htmlDialog = htmlTemplate.evaluate()
    .setWidth(300)
    .setHeight(359);

  SpreadsheetApp.getUi().showModalDialog(htmlDialog, 'Edit Account');
}

function showDialogAddCard () {
  const htmlTemplate = HtmlService.createTemplateFromFile('html/htmlAddEditCard');
  let card;

  htmlTemplate.is_edit = false;

  card = { id: '', name: '', code: '', aliases: '', limit: 0 };

  for (const key in card) {
    htmlTemplate['card_' + key] = card[key];
  }

  const htmlDialog = htmlTemplate.evaluate()
    .setWidth(300)
    .setHeight(359);

  SpreadsheetApp.getUi().showModalDialog(htmlDialog, 'Add Card');
}

function showDialogEditCard (card_id) {
  const htmlTemplate = HtmlService.createTemplateFromFile('html/htmlAddEditCard');
  let card;

  htmlTemplate.is_edit = true;

  card = tablesService('get', 'card', card_id);
  if (!card) return 1;

  card.aliases = card.aliases.join(', ');

  for (const key in card) {
    htmlTemplate['card_' + key] = card[key];
  }

  const htmlDialog = htmlTemplate.evaluate()
    .setWidth(300)
    .setHeight(359);

  SpreadsheetApp.getUi().showModalDialog(htmlDialog, 'Edit Card');
}

function showDialogDeleteCard (card_id) {
  const card = tablesService('get', 'card', card_id);
  if (!card) return 1;

  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Delete card',
    'Are you sure you want to delete ' + card.name + '?',
    ui.ButtonSet.YES_NO);

  if (response == ui.Button.YES) {
    tablesService('set', 'deletecard', card_id);
    return 1;
  }
}
