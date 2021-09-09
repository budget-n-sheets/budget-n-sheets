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
    if (AppsScript.isInstalled()) {
      menu.addItem('Format table', 'toolFormatTable');

      if (!CardsService.isEmpty()) menu.addItem('Forward installments', 'toolForwardInstallments');

      menu.addItem('Insert rows', 'toolInsertRows')
        .addItem('Update cash flow', 'toolUpdateCashFlow')
        .addSeparator()
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

function showPanelQuickstart () {
  const dec_p = SettingsSpreadsheet.getValueOf('decimal_separator');
  const financial_year = SettingsConst.getValueOf('financial_year');

  const scriptlet = {
    isCurrent: (Consts.date < new Date(financial_year, 11, 1)),
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

function showPanelAnalytics () {
  if (UpdateService.checkAndUpdate(true)) return;

  const htmlOutput = HtmlService2.createTemplateFromFile('CoolGallery/htmlSidebar')
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

  if (UpdateService.checkAndUpdate(true)) return;

  const htmlSidebar = new SettingsSidebar().build();
  SpreadsheetApp2.getUi().showSidebar(htmlSidebar);
}

function showDialogAboutAddon () {
  User2.setId();
  let v0;

  if (AppsScript.isInstalled()) v0 = ClassVersion.getValueOf('script');
  else v0 = Info.apps_script.version;

  const htmlOutput = HtmlService2.createTemplateFromFile('html/htmlAboutAddon')
    .assignReservedHref()
    .setScriptletValues({ version: v0.major + '.' + v0.minor + '.' + v0.patch })
    .evaluate()
    .setWidth(281)
    .setHeight(373);

  SpreadsheetApp2.getUi().showModalDialog(htmlOutput, 'About the add-on');
}

function showDialogErrorMessage (err) {
  if (err) LogLog.error(err);

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

  const status = SetupService.checkRequirements();

  let title = '';
  let text = '';

  switch (status) {
    case 0:
      break;
    case 1:
      title = 'New version available';
      text = 'Please, re-open the spreadsheet to update the add-on.';
      break;
    case 2:
      showDialogSetupEnd();
      onOpen();
      return;
    case 3:
      title = "Can't create budget sheet";
      text = 'The add-on was previously deactivated in this spreadsheet which is now locked.\nPlease start in a new spreadsheet.';
      break;
    case 4:
      title = 'Permission denied';
      text = "You don't own the spreadsheet. Please start in a new spreadsheet.";
      break;
    case 5:
      title = 'Linked form';
      text = 'The spreadsheet has a linked form. Please unlink the form first, or create a new spreadsheet.';
      break;

    default:
      console.error('showDialogSetupAddon_(): Switch case is default.');
      showDialogErrorMessage();
      return;
  }

  if (status !== 0) {
    const ui = SpreadsheetApp2.getUi();
    ui.alert(title, text, ui.ButtonSet.OK);
    return;
  }

  SetupUtils.showSetupNotice();

  const scriptlet = {
    uuid: SetupService.getUuid(),
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
  if (!CacheService3.user().get(uuid)) {
    showSessionExpired();
    return;
  }

  const isRestore = (topic === 'restore');
  const title = (isRestore ? 'Select backup' : 'Select spreadsheet');

  const developer_key = Bs.getDeveloperKey();
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
