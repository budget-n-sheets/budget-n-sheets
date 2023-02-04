/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

/** @NotOnlyCurrentDoc */

/**
 * Runs when the add-on is installed; calls onOpen() to ensure menu creation and
 * any other initializion work is done immediately.
 *
 * @param {Object} e The event parameter for a simple onInstall trigger.
 */
function onInstall (e) {
  onOpen(e);
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
    if (Addon.isInstalled()) {
      menu.addItem('Format table', 'toolFormatTable');

      if (!CardsService.isEmpty()) menu.addItem('Forward installments', 'toolForwardInstallments');

      menu.addItem('Insert rows', 'toolInsertRows')
        .addItem('Refresh cash flow', 'toolRefreshCashFlow')
        .addSeparator()
        .addSubMenu(ui.createMenu('Open panel')
          .addItem('Accounts & Cards', 'showPanelTables')
          .addItem('BnS Gallery', 'showPanelAnalytics')
          .addItem('Tagging', 'showPanelTagging'))
        .addSubMenu(ui.createMenu('Pages view')
          .addItem('Collapse', 'toolHideSheets_')
          .addItem('Expand', 'toolShowSheets_')
          .addSeparator()
          .addItem('Toogle view mode', 'toggleViewMode_'))
        .addSeparator()
        .addItem('Change settings', 'showSidebarSettings')
        .addSubMenu(ui.createMenu('More')
          .addItem('About the add-on', 'showDialogAboutAddon')
          .addItem('Check for updates', 'checkForUpdates')
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
  const dec_p = SettingsSpreadsheet.get('decimal_separator');
  const financial_year = SettingsConst.get('financial_year');

  const scriptlet = {
    isCurrent: (Consts.date < new Date(financial_year, 11, 1)),
    dec_p: (dec_p ? '.' : ','),
    dec_n: (dec_p ? 'dot' : 'comma')
  };

  const htmlOutput = HtmlService2.createTemplateFromFile('quickstart/htmlQuickstart')
    .setScriptletValues(HtmlResources.href.reserved)
    .setScriptletValues(scriptlet)
    .evaluate()
    .setTitle('Quickstart');

  SpreadsheetApp2.getUi().showSidebar(htmlOutput);
}

function showPanelAnalytics () {
  if (UpdateService.checkAndUpdate(true)) return;

  const htmlOutput = HtmlService2.createTemplateFromFile('CoolGallery/htmlSidebar')
    .setScriptletValues(HtmlResources.href.reserved)
    .evaluate()
    .setTitle('BnS Gallery');

  SpreadsheetApp2.getUi().showSidebar(htmlOutput);
}

function showPanelTagging () {
  if (!SpreadsheetApp2.getActive().getSheetByName('Tags')) {
    SpreadsheetApp2.getUi().alert("Can't open Tagging", "The sheet Tags is missing.");
    return;
  }

  const htmlOutput = HtmlService2.createTemplateFromFile('tags/htmlDialog')
    .setScriptletValues(HtmlResources.href.reserved)
    .setScriptletValues({ categories: JSON.stringify(Consts.tags_categories) })
    .evaluate()
    .setWidth(281)
    .setHeight(421);

  SpreadsheetApp2.getUi().showModalDialog(htmlOutput, 'Tagging');
}

function showSidebarSettings () {
  if (!AddonUser.hasBaselinePermission()) {
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

function checkForUpdates () {
  if (!Addon.isInstalled()) return;
  if (Addon.isUpToDate()) {
    SpreadsheetApp2.getUi().alert(
      'Budget n Sheets Update',
      "You're up to date.",
      SpreadsheetApp2.getUi().ButtonSet.OK);
    return;
  }

  UpdateService.checkAndUpdate(true);
}

function showDialogAboutAddon () {
  let v0;

  if (Addon.isInstalled()) v0 = ClassVersion.getValueOf('script');
  else v0 = Info.apps_script.version;

  const htmlOutput = HtmlService2.createTemplateFromFile('html/htmlAboutAddon')
    .setScriptletValues(HtmlResources.href.reserved)
    .setScriptletValues({ version: v0.major + '.' + v0.minor + '.' + v0.patch })
    .evaluate()
    .setWidth(281)
    .setHeight(373);

  SpreadsheetApp2.getUi().showModalDialog(htmlOutput, 'About the add-on');
}

function showDialogErrorMessage (err) {
  if (err) LogLog.error(err);

  const htmlOutput = HtmlService2.createTemplateFromFile('html/htmlExceptionMessage')
    .setScriptletValues(HtmlResources.href.reserved)
    .evaluate()
    .setWidth(373)
    .setHeight(137);

  SpreadsheetApp2.getUi().showModalDialog(htmlOutput, 'Something went wrong');
}

function showDialogMessage (title, message, timeout = false) {
  const htmlOutput = HtmlService2.createTemplateFromFile('html/htmlMessageScreen')
    .setScriptletValues(HtmlResources.href.reserved)
    .setScriptletValues({ message: message, hasTimeout: timeout })
    .evaluate()
    .setWidth(263)
    .setHeight(113);

  SpreadsheetApp2.getUi().showModalDialog(htmlOutput, title);
}

function showDialogSetupAddon_ () {
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

  const scriptlet = {
    uuid: SessionService.withUser().startSession().getUuid(),
    setup_follow_up: FeatureFlag.getStatusOf('setup/follow_up'),
    setup_restore: FeatureFlag.getStatusOf('setup/restore'),
    setup_copy: FeatureFlag.getStatusOf('setup/copy')
  };

  const htmlOutput = HtmlService2.createTemplateFromFile('setup/htmlSetupAddon')
    .setScriptletValues(HtmlResources.href.reserved)
    .setScriptletValues(scriptlet)
    .evaluate()
    .setWidth(353)
    .setHeight(359);

  SpreadsheetApp2.getUi().showModalDialog(htmlOutput, 'Start budget spreadsheet');
}

function showDialogSetupFollowUp (uuid) {
  const htmlOutput = new SetupFollowUpDialog(uuid).build();
  SpreadsheetApp2.getUi().showModalDialog(htmlOutput, 'Follow-up budget year');
}

function showDialogSetupRestore (uuid) {
  const htmlOutput = new SetupRestoreDialog(uuid).build();
  SpreadsheetApp2.getUi().showModalDialog(htmlOutput, 'Restore from backup');
}

function showDialogSetupCopy (uuid) {
  const htmlOutput = new SetupCopyDialog(uuid).build();
  SpreadsheetApp2.getUi().showModalDialog(htmlOutput, 'Copy from spreadsheet');
}

function showDialogSetupEnd () {
  const htmlOutput = HtmlService2.createTemplateFromFile('setup/htmlSetupEnd')
    .setScriptletValues(HtmlResources.href.reserved)
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
