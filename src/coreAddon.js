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
}

/**
  * Adds a custom menu with items to show the sidebar and dialog.
  *
  * @param {Object} e The event parameter for a simple onOpen trigger.
  */
function onOpen(e) {
  if(AppsScriptGlobal.test_chamber()) {
    SpreadsheetApp.getUi()
      .createMenu('budget-n-sheets')
      .addItem('A', 'trial_a')
      .addItem('B', 'trial_b')
      .addItem('C', 'trial_c')
      .addItem('Clear', 'trial_clear')
      .addItem('Setup', 'trial_setup')
      .addToUi();
  }

  if(e && e.authMode == ScriptApp.AuthMode.NONE) {
    SpreadsheetApp.getUi()
      .createAddonMenu()
      .addItem('Start budget spreadsheet', 'showSetupAddon_')
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
        .addSeparator()
        .addItem('Open Accounts & Cards panel', 'showPanelTables')
        .addItem('Open Tags panel', 'showPanelTags')
        .addSeparator()
        .addItem('Edit settings', 'showSidebarMainSettings')
        .addItem('About the add-on', 'showDialogAboutAddon')
        .addToUi();

      console.info("add-on/Open : Success.");
    } else {
      SpreadsheetApp.getUi()
        .createAddonMenu()
        .addItem('Start budget spreadsheet', 'showSetupAddon_')
        .addSeparator()
        .addItem('About the add-on', 'showDialogAboutAddon')
        .addToUi();
    }
  }
}



function showPanelTables() {
  if(onlineUpdate_('showPanelTables')) return;
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
  if(onlineUpdate_('showPanelTags')) return;
  else if(optMainTags('isBusy') !== -1) {
    SpreadsheetApp.getUi().alert(
      "Add-on is busy",
      "The add-on is busy. Try again a moment.",
      SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  var htmlTemplate, htmlDialog;
  var InitialMonth, b;

  InitialMonth = optAddonSettings_Get_('InitialMonth');
  b = optAddonSettings_Get_('ScreenResolution');
  b = AppsScriptGlobal.listScreenResolutionFactor()[b];

  htmlTemplate = HtmlService.createTemplateFromFile('htmlMainTags');

  htmlTemplate.ScreenResolution = b;
  htmlTemplate.isInitiated = (optAddonSettings_Get_('ActualMonth') >= (InitialMonth+1));

  htmlDialog = htmlTemplate.evaluate()
    .setWidth(640 * b)
    .setHeight(380 * b);
  SpreadsheetApp.getUi()
    .showModalDialog(htmlDialog, 'Tags');
}


function showSidebarMainSettings() {
  if(onlineUpdate_('showSidebarMainSettings')) return;

  var htmlSidebar = HtmlService.createTemplateFromFile('htmlUserSettings')
    .evaluate()
    .setTitle('Edit settings');
  SpreadsheetApp.getUi()
    .showSidebar(htmlSidebar);
}


function showDialogAboutAddon() {
  if(documentPropertiesService_.getProperty("is_installed")) {
    onlineUpdate_();
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

  var htmlDialog = HtmlService.createTemplateFromFile('htmlExceptionMessage')
    .evaluate()
    .setWidth(340)
    .setHeight(130);
  SpreadsheetApp.getUi()
    .showModalDialog(htmlDialog, 'An error occurred');
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


function optAddonSettings_Save(input) {
  var lock = LockService.getDocumentLock();
  try {
    lock.waitLock(1000);
  } catch(err) {
    return 0;
  }

  try {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheetSettings = spreadsheet.getSheetByName('_Settings');
    var sheetSummary = spreadsheet.getSheetByName('Summary');
    var FinancialYear = optAddonSettings_Get_('FinancialYear');
    var InitialMonth = Number(input.InitialMonth);
    var list, user_settings, i;

    list = AppsScriptGlobal.listNameMonth()[1];

    if(SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetLocale() != optAddonSettings_Get_('SpreadsheetLocale')) {
      update_DecimalSepartor_();
    }

    { // Set new settings values in Settings sheet
      sheetSettings.getRange('B2').setFormula( "="+FinancialYear.formatLocaleSignal() ); // Financial year
      sheetSettings.getRange('B4').setFormula( "="+(InitialMonth + 1).formatLocaleSignal() ); // Initial month

      sheetSettings = spreadsheet.getSheetByName('_Backstage');
      sheetSettings.getRange(2,1, sheetSettings.getMaxRows()-1,sheetSettings.getMaxColumns()).setFontColor('#000000');

      sheetSummary = spreadsheet.getSheetByName('Summary');
      sheetSummary.getRange('B11:I22').setFontColor('#000000');

      sheetSummary.getRange(25, 3, 12, 7).setValue(null);
      for(i = 0;  i < InitialMonth;  i++) {
        sheetSummary.getRange(25+i, 3).setValue(list[i]);
        sheetSummary.getRange(25+i, 4).setFormulaR1C1('=R[-14]C');
        sheetSummary.getRange(25+i, 5).setFormulaR1C1('=-R[-14]C[1]');
      }
      for(;  i < 12;  i++) {
        sheetSummary.getRange(25+i, 3).setValue(list[i]);
        sheetSummary.getRange(25+i, 6).setFormulaR1C1('=R[-14]C[-2]');
        sheetSummary.getRange(25+i, 7).setFormulaR1C1('=-R[-14]C[-1]');
        sheetSummary.getRange(25+i, 8).setFormula('=D10');
        sheetSummary.getRange(25+i, 9).setFormula('=-F10');
      }

      if(InitialMonth > 0) {
        sheetSettings.getRange(2,1, 6*InitialMonth,sheetSettings.getMaxColumns()).setFontColor('#b7b7b7');
        sheetSummary.getRange(11,2, input.InitialMonth,8).setFontColor('#b7b7b7');
      } else {
        sheetSummary.getRange(25, 4).setValue(0);
        sheetSummary.getRange(25, 5).setValue(0);
      }
    }
    {
      user_settings = {
        SpreadsheetLocale: spreadsheet.getSpreadsheetLocale(),
        FinancialYear: FinancialYear,
        InitialMonth: Number(input.InitialMonth),
        ScreenResolution: Number(input.ScreenResolution),

        FinancialCalendar: input.FinancialCalendar,
        OnlyEventsOwned: input.OnlyEventsOwned,
        PostDayEvents: input.PostDayEvents,
        OverrideZero: input.OverrideZero,
        CashFlowEvents: input.CashFlowEvents,
        BlankLines: Number(input.BlankLines)
      };

      setPropertiesService_('document', 'json', 'user_settings', user_settings);
    }

    foo_ColorTabs_();
    return -1;
  } catch(err) {
    Logger.log('optAddonSettings/opt=Save: ' + err.message);
    console.error("optAddonSettings_Save()", err);
    return 1;
  }
}


function optAddonSettings_Get_(select) {
  var user_settings = getPropertiesService_('document', 'json', 'user_settings');
  var dateToday, dateTodayYear, dateTodayMonth;
  var tmp;


  switch(select) {
    case 'docName': // Spreadsheet file name
      return spreadsheet.getName();
    case 'FinancialYear': // Number in YYYY format
      return user_settings.FinancialYear;
    case 'SpreadsheetLocale':
      return user_settings.SpreadsheetLocale;
    case 'FinancialCalendar':
      return user_settings.FinancialCalendar;
    case 'OnlyEventsOwned':
      return user_settings.OnlyEventsOwned;
    case 'PostDayEvents':
      return user_settings.PostDayEvents;
    case 'ScreenResolution':
      return user_settings.ScreenResolution;
    case 'OverrideZero':
      return user_settings.OverrideZero;
    case 'CashFlowEvents':
      return user_settings.CashFlowEvents;
    case 'InitialMonth': // Number in 0-11 range
      return user_settings.InitialMonth;
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
    case 'BlankLines': // Number
      return user_settings.BlankLines;
    default:
      console.error("optAddonSettings_Get_() : Switch case is default.", select);
      break;
  }
}


function optAddonSettings_Set_(select, value) {
  var user_settings = getPropertiesService_('document', 'json', 'user_settings');

  switch(select) {
    case 'InitialMonth':
      user_settings.InitialMonth = value;
      break;
    case 'SpreadsheetLocale':
      user_settings.SpreadsheetLocale = value;
      break;
    case 'FinancialCalendar':
      user_settings.FinancialCalendar = value;
      break;
    case 'OnlyEventsOwned':
      user_settings.OnlyEventsOwned = value;
      break;
    case 'PostDayEvents':
      user_settings.PostDayEvents = value;
      break;
    case 'CashFlowEvents':
      user_settings.CashFlowEvents = value;
      break;
    case 'OverrideZero':
      user_settings.OverrideZero = value;
      break;
    case 'BlankLines':
      user_settings.BlankLines = value;
      break;
    case 'ScreenResolution':
      user_settings.ScreenResolution = value;
      break;
    default:
      console.error("optAddonSettings_Set_() : Switch case is default.", select);
      return false;
  }

  setPropertiesService_('document', 'json', 'user_settings', user_settings);
  return true;
}



function toolAddBlankRows() {
  optMainTools_("AddBlankRows");
}

function toolUpdateCashFlow() {
  optMainTools_("UpdateCashFlow");
}

function toolFormatRegistry() {
  optMainTools_("FormatRegistry");
}


function optMainTools_(p, mm) {
  var lock = LockService.getDocumentLock();
  try {
    lock.waitLock(1000);
  } catch(err) {
    SpreadsheetApp.getUi().alert(
      "Add-on is busy",
      "The add-on is busy. Try again in a moment.",
      SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  switch(p) {
    case 'AddBlankRows':
      optTool_AddBlankRows_(mm);
      break;
    case 'UpdateCashFlow':
      optTool_UpdateCashFlow_(mm);
      break;
    case 'FormatRegistry':
      optTool_FormatRegistry_(mm);
      break;
    default:
      console.error("optMainTools_(): Switch case is default.", p);
      break;
  }
}



function optTool_AddBlankRows_(mm_) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet(),
      sheet;
  var c;

  if(isNaN(mm_)) {
    sheet = SpreadsheetApp.getActiveSheet();
  } else if(mm_ >= 0  &&  mm_ < 12) {
    sheet = spreadsheet.getSheetByName(AppsScriptGlobal.listNameMonth()[0][mm_]);
  } else if(mm_ === 12) {
    sheet = spreadsheet.getSheetByName("Cards");
  } else {
    console.error("optTool_AddBlankRows_(): Internal error.", mm_);
    return;
  }

  if(!sheet) {
    showDialogErrorMessage();
    return;
  } else if(sheet.getSheetName() === "Cards") c = 5;
  else if(AppsScriptGlobal.listNameMonth()[0].indexOf(sheet.getSheetName()) !== -1) c = 4;
  else {
    SpreadsheetApp.getUi().alert(
      "Can't add rows",
      "Select a month or Cards to add rows.",
      SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  var maxRows = sheet.getMaxRows(),
      maxCols = sheet.getMaxColumns();
  var n = optAddonSettings_Get_('BlankLines');
  var values;

  if(maxRows < c + 3) return;


  values = sheet.getRange(maxRows, 1, 1, maxCols).getValues();
  sheet.insertRowsBefore(maxRows, n);
  maxRows += n;

  sheet.getRange(maxRows-n, 1, 1, maxCols).setValues(values);
  sheet.getRange(maxRows-n+1, 1, n-1, maxCols).clear();
  sheet.getRange(maxRows, 1, 1, maxCols).clearContent();
  sheet.getRange(c+2, 1, 1, maxCols)
    .copyTo(sheet.getRange(maxRows-n, 1, n, maxCols), {formatOnly:true});
}


function optTool_UpdateCashFlow_(mm_) {
  if(onlineUpdate_('toolUpdateCashFlow')) return;

  var sheet, range;
  var yyyy, mm;

  if(isNaN(mm_)) {
    sheet = SpreadsheetApp.getActiveSheet();
    range = SpreadsheetApp.getActiveRange();

    mm = AppsScriptGlobal.listNameMonth()[0]
      .indexOf( sheet.getSheetName() );
  } else if(mm_ >= 0  &&  mm_ < 12) {
    mm = mm_;
  } else {
    console.error("optTool_UpdateCashFlow_(): Internal error.", mm_);
    return;
  }

  if(mm === -1  &&  sheet.getSheetName() !== 'Cash Flow') {
    SpreadsheetApp.getUi().alert(
      "Can't update cash flow",
      "Select a month or Cash Flow to update cash flow.",
      SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  yyyy = optAddonSettings_Get_('FinancialYear');

  if(mm === -1) {
    mm = range.getColumn() - 1;
    mm = (mm - (mm % 4)) / 4;
  }

  foo_UpdateCashFlow_(yyyy, mm);
}


function optTool_FormatRegistry_(mm_) {
  var sheet;
  var c;

  if( isNaN(mm_) ) {
    sheet = SpreadsheetApp.getActiveSheet();
    c = AppsScriptGlobal.listNameMonth()[0]
      .indexOf( sheet.getSheetName() );
  } else if(mm_ >= 0  &&  mm_ < 12) {
    c = mm_;
  } else if(mm_ >= 12  &&  mm_ < 24) {
    sheet = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName("Cards");
    c = -1;
  } else {
    console.error("optTool_FormatRegistry_(): Internal error.", mm_);
    return;
  }

  if(c !== -1) {
    foo_FormatRegistry_(c);

  } else if(sheet.getSheetName() === 'Cards') {
    mm_ = mm_ ? mm_ - 12 : null;
    foo_FormatCreditCard_(mm_);

  } else {
    SpreadsheetApp.getUi().alert(
      "Can't format registry",
      "Select a month to format the registry.",
      SpreadsheetApp.getUi().ButtonSet.OK);
  }
}
