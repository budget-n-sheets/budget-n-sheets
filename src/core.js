/** @NotOnlyCurrentDoc */

/**
 * Runs when the add-on is installed; calls onOpen() to ensure menu creation and
 * any other initializion work is done immediately.
 *
 * @param {Object} e The event parameter for a simple onInstall trigger.
 */
function onInstall (e) {
  onOpen(e);
  User2.setId();
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
  const dec_p = getSpreadsheetSettings_('decimal_separator');
  const financial_year = getConstProperties_('financial_year');

  const scriptlet = {
    isCurrent: (DATE_NOW < new Date(financial_year, 11, 1)),
    dec_p: (dec_p ? '.' : ','),
    dec_n: (dec_p ? 'dot' : 'comma')
  };

  const htmlOutput = HtmlService2.createTemplateFromFile('quickstart/htmlQuickstart')
    .assignReservedHref()
    .setScriptletValues(scriptlet)
    .evaluate()
    .setTitle('Quickstart');

  SpreadsheetApp2.getUi().showSidebar(htmlOutput);
}

function showPanelTables (tab) {
  if (onlineUpdate_()) return;

  const dec_s = getSpreadsheetSettings_('decimal_separator');
  const scriptlet = {
    decimal_places: getSpreadsheetSettings_('decimal_places'),
    dec_s: (dec_s ? '.' : ','),
    dec_t: (dec_s ? ',' : '.'),
    tab_acc: (tab ? '' : 'active'),
    tab_cards: (tab ? 'active' : '')
  };

  const htmlOutput = HtmlService2.createTemplateFromFile('tables/htmlSidebarTables')
    .assignReservedHref()
    .setScriptletValues(scriptlet)
    .evaluate()
    .setTitle('Accounts & Cards');

  SpreadsheetApp2.getUi().showSidebar(htmlOutput);
}

function showPanelAnalytics () {
  if (onlineUpdate_()) return;

  const htmlOutput = HtmlService2.createTemplateFromFile('cool_gallery/htmlCoolGallery')
    .assignReservedHref()
    .evaluate()
    .setTitle('BnS Gallery');

  SpreadsheetApp2.getUi().showSidebar(htmlOutput);
}

function showSidebarSettings () {
  if (!User2.isAdmin()) {
    SpreadsheetApp2.getUi().alert(
      'Permission denied',
      "You don't have permission to change the settings.",
      SpreadsheetApp2.getUi().ButtonSet.OK);
    return;
  }

  if (onlineUpdate_()) return;

  const htmlSidebar = new SettingsSidebar().build();
  SpreadsheetApp2.getUi().showSidebar(htmlSidebar);
}

function showDialogAboutAddon () {
  User2.setId();
  let v0;

  if (isInstalled_()) v0 = getClassVersion_('script');
  else v0 = APPS_SCRIPT_GLOBAL.script_version;

  const htmlOutput = HtmlService2.createTemplateFromFile('html/htmlAboutAddon')
    .assignReservedHref()
    .setScriptletValues({ version: v0.major + '.' + v0.minor + '.' + v0.patch })
    .evaluate()
    .setWidth(281)
    .setHeight(373);

  SpreadsheetApp2.getUi().showModalDialog(htmlOutput, 'About the add-on');
}

function showDialogErrorMessage () {
  const htmlOutput = HtmlService2.createTemplateFromFile('html/htmlExceptionMessage')
    .assignReservedHref()
    .evaluate()
    .setWidth(373)
    .setHeight(137);

  SpreadsheetApp2.getUi().showModalDialog(htmlOutput, 'Something went wrong');
}

function showDialogMessage (title, message, timeout) {
  const htmlOutput = HtmlService2.createTemplateFromFile('html/htmlMessageScreen')
    .assignReservedHref()
    .setScriptletValues({ message: message, hasTimeout: timeout })
    .evaluate()
    .setWidth(263)
    .setHeight(113);

  SpreadsheetApp2.getUi().showModalDialog(htmlOutput, title);
}

function showDialogSetupAddon_ () {
  User2.setId();
  if (conditionalInstallTest_()) return;

  const uuid = Utilities.getUuid();
  CacheService2.put('user', uuid, 'boolean', true);

  const scriptlet = {
    uuid: uuid,
    setup_restore: FeatureFlag.getStatusOf('setup/restore'),
    setup_copy: FeatureFlag.getStatusOf('setup/copy')
  };

  const htmlOutput = HtmlService2.createTemplateFromFile('setup/htmlSetupAddon')
    .assignReservedHref()
    .setScriptletValues(scriptlet)
    .evaluate()
    .setWidth(353)
    .setHeight(359);

  SpreadsheetApp2.getUi().showModalDialog(htmlOutput, 'Start budget spreadsheet');
}

function showDialogSetupRestore (uuid, msg) {
  const htmlOutput = HtmlService2.createTemplateFromFile('setup/restore/htmlSetupRestore')
    .assignReservedHref()
    .setScriptletValues({
      isValid: (msg === ''),
      msg: (msg || ''),
      uuid: uuid
    })
    .evaluate()
    .setWidth(353)
    .setHeight(359);

  SpreadsheetApp2.getUi().showModalDialog(htmlOutput, 'Restore from backup');
}

function showDialogSetupCopy (uuid, msg) {
  const htmlOutput = HtmlService2.createTemplateFromFile('setup/restore/htmlSetupCopy')
    .assignReservedHref()
    .setScriptletValues({
      isValid: (msg === ''),
      msg: (msg || ''),
      uuid: uuid
    })
    .evaluate()
    .setWidth(353)
    .setHeight(359);

  SpreadsheetApp2.getUi().showModalDialog(htmlOutput, 'Copy from spreadsheet');
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

  const htmlOutput = HtmlService2.createTemplateFromFile('setup/restore/htmlPickerRestore')
    .setScriptletValues({
      picker_key: developer_key,
      isRestore: isRestore,
      uuid: uuid
    })
    .evaluate()
    .setWidth(617)
    .setHeight(487);

  SpreadsheetApp2.getUi().showModalDialog(htmlOutput, title);
}

function showDialogSetupEnd () {
  const htmlOutput = HtmlService2.createTemplateFromFile('setup/htmlSetupEnd')
    .assignReservedHref()
    .evaluate()
    .setWidth(353)
    .setHeight(367);

  SpreadsheetApp2.getUi().showModalDialog(htmlOutput, 'Add-on Budget n Sheets');
}

function showSessionExpired () {
  const ui = SpreadsheetApp2.getUi();

  ui.alert(
    'Session expired',
    'Your session timed out. Please try again.',
    ui.ButtonSet.OK);
}

function showDialogEditAccount (acc_id) {
  const decimal_places = getSpreadsheetSettings_('decimal_places');
  const account = tablesService('get', 'account', acc_id);
  if (!account) return 1;

  const scriptlet = {
    step: (decimal_places > 0 ? '0.' + '0'.repeat(decimal_places - 1) + '1' : '1'),
    placeholder: (decimal_places > 0 ? '0.' + '0'.repeat(decimal_places) : '0')
  };

  for (const key in account) {
    scriptlet['acc_' + key] = account[key];
  }

  const htmlOutput = HtmlService2.createTemplateFromFile('tables/htmlEditAccount')
    .setScriptletValues(scriptlet)
    .evaluate()
    .setWidth(300)
    .setHeight(359);

  SpreadsheetApp2.getUi().showModalDialog(htmlOutput, 'Edit Account');
}

function showDialogAddCard () {
  const decimal_places = getSpreadsheetSettings_('decimal_places');

  const scriptlet = {
    is_edit: false,
    step: (decimal_places > 0 ? '0.' + '0'.repeat(decimal_places - 1) + '1' : '1'),
    placeholder: (decimal_places > 0 ? '0.' + '0'.repeat(decimal_places) : '0'),

    card_id: '',
    card_name: '',
    card_code: '',
    card_aliases: '',
    card_limit: 0
  };

  const htmlOutput = HtmlService2.createTemplateFromFile('tables/htmlAddEditCard')
    .setScriptletValues(scriptlet)
    .evaluate()
    .setWidth(300)
    .setHeight(359);

  SpreadsheetApp2.getUi().showModalDialog(htmlOutput, 'Add Card');
}

function showDialogEditCard (card_id) {
  const decimal_places = getSpreadsheetSettings_('decimal_places');
  const card = tablesService('get', 'card', card_id);
  if (!card) return 1;

  const scriptlet = {
    is_edit: true,
    step: (decimal_places > 0 ? '0.' + '0'.repeat(decimal_places - 1) + '1' : '1'),
    placeholder: (decimal_places > 0 ? '0.' + '0'.repeat(decimal_places) : '0')
  };

  card.aliases = card.aliases.join(', ');
  for (const key in card) {
    scriptlet['card_' + key] = card[key];
  }

  const htmlOutput = HtmlService2.createTemplateFromFile('tables/htmlAddEditCard')
    .setScriptletValues(scriptlet)
    .evaluate()
    .setWidth(300)
    .setHeight(359);

  SpreadsheetApp2.getUi().showModalDialog(htmlOutput, 'Edit Card');
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
