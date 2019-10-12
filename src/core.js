/**
  * @NotOnlyCurrentDoc Limits the script to only accessing the current spreadsheet.
  */

/**
  * Runs when the add-on is installed; calls onOpen() to ensure menu creation and
  * any other initializion work is done immediately.
  *
  * @param {Object} e The event parameter for a simple onInstall trigger.
  */
function onInstall(e) {
	onOpen(e);

	console.info("add-on/Purchase : Success.");
}

/**
  * Adds a custom menu with items to show the sidebar and dialog.
  *
  * @param {Object} e The event parameter for a simple onOpen trigger.
  */
function onOpen(e) {

	try {
	  trial_onOpen();
	} catch(err) {

	}

  if(e && e.authMode == ScriptApp.AuthMode.NONE) {
    SpreadsheetApp.getUi()
      .createAddonMenu()
      .addItem('Start budget sheet', 'showSetupAddon_')
      .addSeparator()
      .addItem('About the add-on', 'showDialogAboutAddon')
      .addToUi();
  } else {
    if(PropertiesService.getDocumentProperties().getProperty('is_installed')) {
      SpreadsheetApp.getUi()
        .createAddonMenu()
        .addItem('Add blank lines', 'toolAddBlankRows')
        .addItem('Format registry', 'toolFormatRegistry')
        .addItem('Update cash flow', 'toolUpdateCashFlow')
        .addSubMenu(SpreadsheetApp.getUi().createMenu("Pages view")
          .addItem("Collapse", "toolHideSheets_")
          .addItem("Expand", "toolShowSheets_"))
        .addSeparator()
        .addItem('Open Accounts & Cards panel', 'showPanelTables')
        .addItem('Open Tags panel', 'showPanelTags')
        .addSeparator()
        .addItem('About the add-on', 'showDialogAboutAddon')
        .addItem('Edit settings', 'showSidebarMainSettings')
        .addToUi();

      console.info("add-on/Open : Success.");
    } else {
      SpreadsheetApp.getUi()
        .createAddonMenu()
        .addItem('Start budget sheet', 'showSetupAddon_')
        .addSeparator()
        .addItem('About the add-on', 'showDialogAboutAddon')
        .addToUi();
    }
  }
}



function showPanelTables() {
  if(onlineUpdate_()) return;
  else if(optMainTables('isBusy') !== -1) {
    SpreadsheetApp.getUi().alert(
      "Add-on is busy",
      "The add-on is busy. Try again a moment.",
      SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  var htmlSidebar = HtmlService.createTemplateFromFile('htmlMainTables')
    .evaluate()
    .setTitle('Accounts & Cards');
  SpreadsheetApp.getUi()
    .showSidebar(htmlSidebar);
}


function showPanelTags() {
  if(onlineUpdate_()) return;
  else if(optMainTags('isBusy') !== -1) {
    SpreadsheetApp.getUi().alert(
      "Add-on is busy",
      "The add-on is busy. Try again a moment.",
      SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  var htmlTemplate, htmlDialog;

  htmlTemplate = HtmlService.createTemplateFromFile('htmlMainTags');

  htmlTemplate.isInitiated = (optAddonSettings_Get_("MFactor") > 0);

  htmlDialog = htmlTemplate.evaluate()
    .setWidth(640)
    .setHeight(509);
  SpreadsheetApp.getUi()
    .showModalDialog(htmlDialog, 'Tags');
}


function showSidebarMainSettings() {
  if(onlineUpdate_()) return;

  var htmlSidebar = HtmlService.createTemplateFromFile('htmlUserSettings')
    .evaluate()
    .setTitle('Edit settings');
  SpreadsheetApp.getUi()
    .showSidebar(htmlSidebar);
}


function showDialogAboutAddon() {
  try {
    if(getPropertiesService_("document", "", "is_installed")) {
      onlineUpdate_();
    }
  } catch(err) {
    console.error("showDialogAboutAddon()", err);
  }

  var htmlDialog, htmlTemplate;

  htmlTemplate = HtmlService.createTemplateFromFile('htmlAboutAddon')

  htmlTemplate.version = AppsScriptGlobal.AddonVersionName();

  htmlDialog = htmlTemplate.evaluate()
    .setWidth(281)
    .setHeight(359);
  SpreadsheetApp.getUi()
    .showModalDialog(htmlDialog, 'About the add-on');
}


function showDialogErrorMessage() {
  console.warn("showDialogErrorMessage() : Ops...");

  var htmlDialog = HtmlService.createHtmlOutputFromFile("htmlExceptionMessage")
    .setWidth(373)
    .setHeight(113);
  SpreadsheetApp.getUi()
    .showModalDialog(htmlDialog, "Something went wrong");
}


function showDialogQuickMessage(text, button, bar) {
  var htmlTemplate, htmlDialog;
  var height;

  height = 107 + (text.length - text.length % 31) / 31 * 20;


  htmlTemplate = HtmlService.createTemplateFromFile('htmlQuickMessage');
  htmlTemplate.text = text;
  htmlTemplate.button = button;
  htmlTemplate.bar = bar;

  htmlDialog = htmlTemplate.evaluate()
    .setWidth(307)
    .setHeight(height);

  SpreadsheetApp.getUi()
    .showModalDialog(htmlDialog, 'Budget n Sheets');
}



function optAddonSettings_Retrieve() {
  var user_settings = getPropertiesService_('document', 'json', 'user_settings');

  user_settings.docName = SpreadsheetApp.getActiveSpreadsheet().getName();
  user_settings.listCalendars = optCalendar_GetListOwned();

  return user_settings;
}


function optAddonSettings_Save(settings) {
  var lock = LockService.getDocumentLock();
  try {
    lock.waitLock(200);
  } catch(err) {
    return 0;
  }

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet;
  var user_settings, yyyy, init;

  try {
    if(!update_DecimalSepartor_()) return 1;
  } catch(err) {
    console.error("update_DecimalSepartor_()", err);
    return 1;
  }

  yyyy = optAddonSettings_Get_("FinancialYear");
  init = Number(settings.InitialMonth);

  sheet = spreadsheet.getSheetByName("_Settings");
  if(!sheet) return 1;

  sheet.getRange("B2")
    .setFormula("=" + yyyy.formatLocaleSignal());
  sheet.getRange("B4")
    .setFormula("=" + (init + 1).formatLocaleSignal());
  SpreadsheetApp.flush();

  try {
    user_settings = {
      SpreadsheetLocale: spreadsheet.getSpreadsheetLocale(),
      FinancialYear: yyyy,
      InitialMonth: init,

      FinancialCalendar: settings.FinancialCalendar,
      OnlyEventsOwned: false,
      PostDayEvents: settings.PostDayEvents,
      OverrideZero: settings.OverrideZero,
      CashFlowEvents: settings.CashFlowEvents
    };

    setPropertiesService_("document", "json", "user_settings", user_settings);
  } catch(err) {
    console.error("optAddonSettings_Save_()", err);
    return 1;
  }

	setPropertiesService_("document", "string", "update_layout", "[ ]");
  return -1;
}


function optAddonSettings_Get_(select) {
  var user_settings = getPropertiesService_('document', 'json', 'user_settings');
  var dateToday, dateTodayYear, dateTodayMonth;
  var tmp;

  switch(select) {
    case 'docName': // Spreadsheet file name
      return spreadsheet.getName();
    case 'FinancialYear': // Number in YYYY format
    case 'SpreadsheetLocale':
    case 'FinancialCalendar':
    case 'OnlyEventsOwned':
    case 'PostDayEvents':
    case 'OverrideZero':
    case 'CashFlowEvents':
    case 'InitialMonth': // Number in 0-11 range
      return user_settings[select];
    case 'ActualMonth': // Number in 0-12 range
      dateToday = getSpreadsheetDate();

      if(dateToday.getFullYear() == user_settings.FinancialYear) return dateToday.getMonth() + 1;
      else if(dateToday.getFullYear() < user_settings.FinancialYear) return 0;
      else return 12;
    case 'ActiveMonths': // Number in 0-12 range
      dateToday = getSpreadsheetDate();
      dateTodayMonth;

      if(dateToday.getFullYear() == user_settings.FinancialYear) dateTodayMonth = dateToday.getMonth() + 1;
      else if(dateToday.getFullYear() < user_settings.FinancialYear) dateTodayMonth = 0;
      else dateTodayMonth = 12;

      user_settings.InitialMonth++;
      if(user_settings.InitialMonth > dateTodayMonth) return 0;
      else return (dateTodayMonth - user_settings.InitialMonth + 1);
    case 'MFactor': // Number in 0-12 range
      dateTodayYear = getSpreadsheetDate().getFullYear();
      tmp = optAddonSettings_Get_('ActiveMonths');

      if(dateTodayYear == user_settings.FinancialYear) {
        tmp--;
        if(tmp > 0) return tmp;
        else return 0;
      } else if(dateTodayYear < user_settings.FinancialYear) {
        return 0;
      } else {
        return tmp;
      }
    default:
      console.error("optAddonSettings_Get_() : Switch case is default.", select);
      break;
  }
}


function optAddonSettings_Set_(select, value) {
  var user_settings = getPropertiesService_('document', 'json', 'user_settings');

  switch(select) {
    case 'InitialMonth':
    case 'SpreadsheetLocale':
    case 'FinancialCalendar':
    case 'OnlyEventsOwned':
    case 'PostDayEvents':
    case 'CashFlowEvents':
    case 'OverrideZero':
      user_settings[select] = value;
      break;
    default:
      console.error("optAddonSettings_Set_() : Switch case is default.", select);
      return false;
  }

  setPropertiesService_('document', 'json', 'user_settings', user_settings);
  return true;
}
