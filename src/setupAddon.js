function showSetupAddon_() {
  var Ui = SpreadsheetApp.getUi();

  try {
    SpreadsheetApp.openById(AppsScriptGlobal.SpreadsheetTemplateId());
  } catch(err) {
    Logger.log('showSetupAddon: ' + err.message);
    console.warn("showSetupAddon_()", err);

    Ui.alert(
      "Budget n Sheets",
      "The add-on is updating. Try again later.",
      Ui.ButtonSet.OK);

    return;
  }

  if(Session.getActiveUser().getEmail() !== SpreadsheetApp.getActiveSpreadsheet().getOwner().getEmail()) {
    Ui.alert(
      "Permission required",
      "You do not have enough permission to setup the add-on!",
      Ui.ButtonSet.OK);
    return;

  } else if(Session.getActiveUser().getEmail() !== Session.getEffectiveUser().getEmail()) {
    Ui.alert(
      "Permission required",
      "You do not have enough permission to setup the add-on!",
      Ui.ButtonSet.OK);
    return;

  } else if( documentPropertiesService_.getProperty("is_installed") ) {
    Ui.alert(
      "Activation complete",
      "Reopen the spreadsheet to apply pending changes.",
      Ui.ButtonSet.OK);
    return;

  } else if(new Date().getTime() < AppsScriptGlobal.DateNextRelease()) {
    Ui.alert(
      "Budget n Sheets",
      "The add-on is updating. Try again later.",
      Ui.ButtonSet.OK);
    return;

  } else if(SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetLocale() != 'en_US') {
    var auxCell = Ui.alert(
      "Locale",
      "It is necessary to change the Locale of the spreadsheet. This affects formatting details such as functions, dates, and currency.\nClick OK to change now.",
      Ui.ButtonSet.OK_CANCEL);

    if(auxCell == Ui.Button.OK) {
      SpreadsheetApp.getActiveSpreadsheet()
        .setSpreadsheetLocale('en_US');
    }
    return;

  } else if(SpreadsheetApp.getActiveSpreadsheet().getFormUrl() != null) {
    Ui.alert(
      "Linked form",
      "The spreadsheet has a linked form. Please unlink the form first, or create a new spreadsheet.",
      Ui.ButtonSet.OK);
    return;
  }

  var htmlDialog = HtmlService.createTemplateFromFile('htmlSetupAddon')
    .evaluate()
    .setWidth(353)
    .setHeight(359);
  SpreadsheetApp.getUi()
    .showModalDialog(htmlDialog, 'Start budget spreadsheet');
}

function askDeactivation() {
  var Ui = SpreadsheetApp.getUi(); // Same variations.
  var s = randomString(5, 'upnum');

  var result = Ui.prompt(
      'Deactivate add-on',
      'This action cannot be undone!\nPlease type in the code ' + s + ' to confirm:',
      Ui.ButtonSet.OK_CANCEL);

  var button = result.getSelectedButton();
  var text = result.getResponseText();
  if (button == Ui.Button.OK  &&  text === s) {
    uninstall_();
    onOpen();
    console.info("add-on/Deactivate : Success.");
    return true;
  }
}

function askReinstall() {
  if( documentPropertiesService_.getProperty("is_installed") ) return;

  var FinancialYear = optAddonSettings_Get_('FinancialYear');
  var dateToday = getSpreadsheetDate();


  setPropertiesService_('document', 'string', 'onOpenMainId', '');
  setPropertiesService_('document', 'string', 'onEditMainId', '');
  setPropertiesService_('document', 'string', 'dailyMainId', '');
  setPropertiesService_('document', 'string', 'weeklyMainId', '');

  purgeScriptAppTriggers_();

  createScriptAppTriggers_('document', 'onEditMainId', 'onEdit', 'onEdit_Main_');

  if(FinancialYear < dateToday.getFullYear()) {
    setPropertiesService_('document', 'string', 'OperationMode', 'passive');
    createScriptAppTriggers_('document', 'weeklyMainId', 'onWeekDay', 'weekly_Main_', 2);

  } else if(FinancialYear === dateToday.getFullYear()) {
    setPropertiesService_('document', 'string', 'OperationMode', 'active');
    createScriptAppTriggers_('document', 'dailyMainId', 'everyDays', 'daily_Main_', 1, 2);

  } else if(FinancialYear > dateToday.getFullYear()) {
    setPropertiesService_('document', 'string', 'OperationMode', 'passive');
    createScriptAppTriggers_('document', 'onOpenMainId', 'onOpen', 'onOpen_Main_');
    createScriptAppTriggers_('document', 'weeklyMainId', 'onWeekDay', 'weekly_Main_', 2);
  }
}


function uninstall_() {
  var list = ScriptApp.getUserTriggers( SpreadsheetApp.getActiveSpreadsheet() );

  for(var i = 0; i < list.length; i++) {
    ScriptApp.deleteTrigger(list[i]);
  }

  PropertiesService.getDocumentProperties().deleteAllProperties();
  PropertiesService.getScriptProperties().deleteAllProperties();
  PropertiesService.getUserProperties().deleteAllProperties();
}


function setup_ui(settings, list) {
  if(PropertiesService.getDocumentProperties().getProperty("is_installed")) return 0;

  var lock = LockService.getDocumentLock();
  try {
    lock.waitLock(200);
  } catch(err) {
    SpreadsheetApp.getUi().alert(
      "Add-on is installing",
      "The add-on is installing. Try again a moment.",
      SpreadsheetApp.getUi().ButtonSet.OK);
    return 0;
  }

  try {
    var s = setup_(settings, list);
  } catch(err) {
    console.error("setup_ui()", err);
    uninstall_();
  }

  if(!s) {
    showDialogErrorMessage();
    return 0;
  }

  setPropertiesService_("document", "string", "is_installed", "[ ]");
  onOpen();

  Logger.log("add-on/Install: Success.");
  console.info("add-on/Install: Success.");
  return -1;
}

function setup_(addonSettings, listAccountName) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var dateToday = getSpreadsheetDate();
  var timer, chk;

  addonSettings.FinancialYear = Number(addonSettings.FinancialYear);
  addonSettings.InitialMonth = Number(addonSettings.InitialMonth);
  addonSettings.number_accounts = Number(addonSettings.number_accounts);

  dateToday = {
    FullYear: dateToday.getFullYear(),
    Month: dateToday.getMonth()
  };

  timer = 500;

  console.time("add-on/Install");

  spreadsheet.rename(addonSettings.SpreadsheetName);

  purgeScriptAppTriggers_();
  purgePropertiesService_();

  chk = setup_FormatSpreadsheet_(timer);
  if(!chk) {
    console.error("Function setup_FormatSpreadsheet_() failed.");
    showDialogErrorMessage();
    return;
  }

  chk = setup_ExecutePatial_(timer, addonSettings, listAccountName, dateToday);
  if(!chk) {
    console.error("Function setup_ExecutePatial_() failed.");
    showDialogErrorMessage();
    return;
  }

  setPropertiesService_('document', 'string', 'authorizationStatus', '');
  setPropertiesService_('document', 'number', 'LNE_VERSION', AppsScriptGlobal.AddonVersion());

  console.timeEnd("add-on/Install");
  return true;
}


function setup_FormatSpreadsheet_(timer) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var listEssentialSheets = [ '_Backstage', 'Summary', 'Jan', 'Dec', '_Settings' ];
  var thisSheet;
  var i, k;


  deleteAllSheets_();
  copySheetsFromTemplate_();

  for(i = 0;  i < listEssentialSheets.length;  i++) {
    k = 0;
    thisSheet = spreadsheet.getSheetByName( listEssentialSheets[i] );

    while(!thisSheet  &&  k < 10) {
      switch(k) {
        case 0:
          Utilities.sleep(401);
          break;
        case 1:
          Utilities.sleep(1009);
          break;
        case 2:
        case 3:
        case 4:
          Utilities.sleep(2003);
          break;
        case 5:
          Utilities.sleep(3001);
          break;
        default:
          return false;
      }

      k++;
      thisSheet = spreadsheet.getSheetByName(listEssentialSheets[i]);
    }
  }

  sortSheetOrder_(spreadsheet);

  spreadsheet.setActiveSheet( spreadsheet.getSheetByName('Summary') );

  return true;
}


function sortSheetOrder_(spreadsheet) {
  var sheet;
  var list = [ "Summary", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Cards", "Cash Flow", "Tags", "Quick Actions", "_Settings", "_Backstage", "About" ];
  var i;


  i = 0;
  while(i < list.length) {
    sheet = spreadsheet.getSheetByName(list[i]);
    if(!sheet) {
      i++;
      continue;
    }

    spreadsheet.setActiveSheet(sheet);
    spreadsheet.moveActiveSheet(i + 1);
    i++;
  }
}



function setup_ExecutePatial_(timer, addonSettings, listAccountName, dateToday) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet(),
      sheetFinances = spreadsheet.getSheetByName('Summary'),
      sheetBackstage = spreadsheet.getSheetByName('_Backstage'),
      sheetSettings = spreadsheet.getSheetByName('_Settings');
  var number_accounts;
  var chk;

  if(!sheetFinances) return;
  if(!sheetBackstage) return;
  if(!sheetSettings) return;

  listNameMonths = AppsScriptGlobal.listNameMonth()[0];
  numberLneAccount = addonSettings.number_accounts;


  chk = setupPart3_(spreadsheet, listNameMonths, numberLneAccount);
  if(chk) return;
  Utilities.sleep(timer);

  chk = setupPart1_(spreadsheet, sheetSettings, addonSettings, dateToday);
  if(chk) return;
  Utilities.sleep(timer);

  chk = setupPart2_(sheetBackstage, listAccountName, addonSettings.InitialMonth, numberLneAccount);
  if(chk) return;
  Utilities.sleep(timer);


  chk = setupPart4_(spreadsheet, listNameMonths, numberLneAccount);
  if(chk) return;
  Utilities.sleep(timer);


  chk = setupPart5_(spreadsheet, sheetBackstage, numberLneAccount);
  if(chk) return;
  Utilities.sleep(timer);
  chk = setupPart6_(spreadsheet, sheetBackstage, listNameMonths, numberLneAccount);
  if(chk) return;
  Utilities.sleep(timer);

  chk = setupPart7_(spreadsheet, dateToday, addonSettings.FinancialYear, addonSettings.InitialMonth, listNameMonths, numberLneAccount);
  if(chk) return;
  Utilities.sleep(timer);


  chk = setupPart9_(sheetFinances, addonSettings.InitialMonth);
  if(chk) return;
  Utilities.sleep(timer);


  chk = setupPart10_(numberLneAccount, addonSettings.FinancialYear, addonSettings.InitialMonth);
  if(chk) return;
  Utilities.sleep(timer);


  chk = setupPart11_(spreadsheet, listNameMonths, numberLneAccount);
  if(chk) return;
  Utilities.sleep(timer);

  return true;
}


/**
  * Add protection to sheets and ranges so prevent users from messing up.
  */
function setupPart11_(spreadsheet, listNameMonths, number_accounts) {
  var thisSheet;
  var vRange;
  var i, k;

  try {
    {
      spreadsheet.getSheetByName('_Backstage').protect().setWarningOnly(true);
      spreadsheet.getSheetByName('Tags').protect().setWarningOnly(true);
      spreadsheet.getSheetByName('_Settings').protect().setWarningOnly(true);
      spreadsheet.getSheetByName('About').protect().setWarningOnly(true);
      spreadsheet.getSheetByName('Summary').protect().setWarningOnly(true);
    }
    {
      thisSheet = spreadsheet.getSheetByName('Cash Flow');
      vRange = [ ];
      for(i = 0;  i < 12;  i++) {
        vRange.push( thisSheet.getRange(3,2+4*i, 31) );
        vRange.push( thisSheet.getRange(3,4+4*i, 31) );
      }
      thisSheet.protect().setUnprotectedRanges(vRange).setWarningOnly(true);
    }
    {
      thisSheet = spreadsheet.getSheetByName('Cards');
      vRange = [ ];
      for(i = 0;  i < 12;  i++) {
        vRange.push( thisSheet.getRange(6,1+6*i, 100,5) );
        vRange.push( thisSheet.getRange(2,1+6*i, 1,3) );
      }
      thisSheet.protect().setUnprotectedRanges(vRange).setWarningOnly(true);
    }
    {
      thisSheet = spreadsheet.getSheetByName("Quick Actions");

      vRange = [ ];
      vRange.push( thisSheet.getRange(4, 2, 3, 1) );
      vRange.push( thisSheet.getRange(9, 2, 2, 1) );

      thisSheet.protect()
        .setUnprotectedRanges(vRange)
        .setWarningOnly(true);
    }
    {
      i = 0;
      while(i < 12) {
        thisSheet = spreadsheet.getSheetByName(listNameMonths[i]);
        vRange = [ ];

        for(k = 0;  k < 1+number_accounts;  k++) {
          vRange.push( thisSheet.getRange(5,1+5*k, 100,4) );
        }
        thisSheet.protect().setUnprotectedRanges(vRange).setWarningOnly(true);

        i++;
        Utilities.sleep(137);
      }
    }

    SpreadsheetApp.flush();
  } catch(err) {
    Logger.log('setupSpreadsheet/part=11 : ' + err.message);
    console.error("setupPart11_()", err);
    return true;
  }
}

/**
  * Setup the sheet 'Cash Flow'.
  */
function setupPart10_(number_accounts, Y, m) {
  try {
    var sheetCashFlow = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Cash Flow');
    var d, s;
    var i, j, k;


    /* ----- Mês 0 --- */
    i=0;
    sheetCashFlow.getRange(3,3+i*4).setFormula('=0');

    d = new Date(Y, i+1, 0).getDate();
    sheetCashFlow.getRange(4,3+i*4, d-1).setFormulaR1C1('=R[-1]C+RC[-1]');
    if(d < 31) {
      sheetCashFlow.getRange(3+d,2+i*4, 31-d,3).setBackground('#f3f3f3');
    }

    s = new Date(Y, 0, 1).getDay(); j=0;
    while(j < d) {
      switch(s) {
        case 0:
          sheetCashFlow.getRange(3+j,2, 1,3).setBackground('#d9ead3');
          s += 6;  j += 6;
          break;
        case 6:
          sheetCashFlow.getRange(3+j,2, 1,3).setBackground('#d9ead3');
          s = 0;  j++;
          break;
        default:
          s = (s+1)%7;  j++;
          break;
      }
    }

    /* ----- Meses 1-11 --- */
    for(i = 1;  i < 12;  i++) {
      sheetCashFlow.getRange(3,3+i*4).setFormulaR1C1('=R['+(d-1)+']C[-4]+RC[-1]');

      d = new Date(Y, i+1, 0).getDate();
      sheetCashFlow.getRange(4,3+i*4, d-1).setFormulaR1C1('=R[-1]C+RC[-1]');
      if(d < 31) {
        sheetCashFlow.getRange(3+d,2+i*4, 31-d,3).setBackground('#f3f3f3');
      }

      s = new Date(Y, i, 1).getDay(); j=0;
      while(j < d) {
        switch(s) {
          case 0:
            sheetCashFlow.getRange(3+j,2+i*4, 1,3).setBackground('#d9ead3');
            s=6; j+=6;
            break;
          case 6:
            sheetCashFlow.getRange(3+j,2+i*4, 1,3).setBackground('#d9ead3');
            s=0; j++;
            break;
          default:
            s=(s+1)%7; j++;
            break;
        }
      }
    }

    /* ----- Ajustes finais --- */
    optMainTables('UpdateTableRef');

    SpreadsheetApp.flush();
  } catch(err) {
    Logger.log('setupSpreadsheet/part=10 : ' + err.message);
    console.error("setupPart10_()", err);
    return true;
  }
}


function setupPart9_(sheetSummary, mm) {
  try {
    var list, cell, options, i;

    list = AppsScriptGlobal.listNameMonth()[1];
    options = {
      0:{color:'#b7b7b7', type:'bars', labelInLegend:'Income\''},
      1:{color:'#cccccc', type:'bars', labelInLegend:'Expenses\''},
      2:{color:'#45818e', type:'bars', labelInLegend:'Income'},
      3:{color:'#e69138', type:'bars', labelInLegend:'Expenses'},
      4:{color:'#45818e', type:'line', labelInLegend:'Avg inc'},
      5:{color:'#e69138', type:'line', labelInLegend:'Avg exp'}
    };


    sheetSummary.getRange(25, 3, 12, 7).setValue(null);
    for(i = 0;  i < mm;  i++) {
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
    if(mm == 0) {
      sheetSummary.getRange(25, 4).setValue(0);
      sheetSummary.getRange(25, 5).setValue(0);
    }

    // Column chart builder
    cell = sheetSummary.newChart()
    .addRange(sheetSummary.getRange('C25:I36'))
    .setChartType(Charts.ChartType.COMBO)
    .setPosition(24, 2, 0, 0)
    .setOption('mode', 'view')
    .setOption('theme', 'maximized')
    .setOption('focusTarget', 'category')
    .setOption('series', options)
    .setOption('height', 335)
    .setOption('width', 886);

    sheetSummary.insertChart(cell.build());
    SpreadsheetApp.flush();
  } catch(err) {
    Logger.log('setupSpreadsheet/part=9 : ' + err.message);
    console.error("setupPart9_()", err);
    return true;
  }
}

/**
  * Ajustes finais.
  */
function setupPart7_(spreadsheet, dateToday, Y, m, listNameMonths, number_accounts) {
  try {
    var sheetTags = spreadsheet.getSheetByName('Tags');
    var sheetCashFlow = spreadsheet.getSheetByName('Cash Flow'),
        sheetSummary = spreadsheet.getSheetByName('Summary');
    var matrixFormulas;
    var i;

    {
      sheetSummary.setTabColor('#e69138');
      foo_ColorTabs_();
      spreadsheet.getSheetByName('Cash Flow').setTabColor('#e69138');
      spreadsheet.getSheetByName('Cards').setTabColor('#e69138').hideSheet();
      spreadsheet.getSheetByName('Tags').setTabColor('#e69138');
      spreadsheet.getSheetByName('Quick Actions').setTabColor('#6aa84f');
      spreadsheet.getSheetByName('_Backstage').setTabColor('#cc0000').hideSheet();
      spreadsheet.getSheetByName('_Settings').setTabColor('#cc0000').hideSheet();
      spreadsheet.getSheetByName('About').hideSheet();
    }

    sheetSummary.getRange('B2').setValue(Y+' | Year Summary');
    if(m > 0) {
      spreadsheet.getSheetByName('_Backstage').getRange(2,1, 6*m,spreadsheet.getSheetByName('_Backstage').getMaxColumns()).setFontColor('#b7b7b7');
      sheetSummary.getRange(11,2, m,8).setFontColor('#b7b7b7');
    }

    if(dateToday.FullYear == Y) {
      sheetTags.hideColumns(5, 12);

      for(i = 0;  i < 12;  i++) {
        if(i < dateToday.Month-1  ||  i > dateToday.Month+2) {
          spreadsheet.getSheetByName(listNameMonths[i]).hideSheet();
        } else {
          spreadsheet.getSheetByName(listNameMonths[i]).showSheet();
        }
      }

      if(dateToday.Month < 2) {
        sheetTags.showColumns(5,4);
      } else {

        if(dateToday.Month == 11) {
          spreadsheet.getSheetByName(listNameMonths[9]).showSheet();
          dateToday.Month--;
        }
        sheetTags.showColumns(3+dateToday.Month,4);
      }
    }

    SpreadsheetApp.flush();
  } catch(err) {
    Logger.log('setupSpreadsheet/part=7 : ' + err.message);
    console.error("setupPart7_()", err);
    return true;
  }
}

/**
  * Install essential formulas; tables for banking account, sheet '_Backstage'.
  */
function setupPart6_(spreadsheet, sheetBackstage, listNameMonths, number_accounts) {
  try {
    var thisSheet;
    var i, k;


    for(i = 0;  i < 12;  i++) {
      thisSheet = spreadsheet.getSheetByName(listNameMonths[i]);

      thisSheet.getRange('A3').setFormula('CONCAT("Expenses "; TO_TEXT(\'_Backstage\'!$B' + (4+6*i) + '))');

      for(k = 0;  k < number_accounts;  k++) {
        thisSheet.getRange(1, 8+5*k).setFormula('=LNEINF(\'_Backstage\'!' + rollA1Notation(2+6*i,5+k*3, 6,2) + '; \'_Backstage\'!'+rollA1Notation(5+i*6, 4+k*3)+')');
        //thisSheet.getRange(1, 8+5*k).setFormula('=LNEINF(\'_Backstage\'!' + sheetBackstage.getRange(2+6*i,5+k*3, 6,2).getB1Notation() + '; \'_Backstage\'!'+sheetBackstage.getRange(5+i*6, 4+k*3).getB1Notation() + ')');

        thisSheet.getRange(2, 6+5*k).setFormula('=CONCAT("Balance "; TO_TEXT(\'_Backstage\'!'+rollA1Notation(3+6*i, 4+k*3)+'))');
        //thisSheet.getRange(2, 6+5*k).setFormula('=CONCAT("Balance "; TO_TEXT(\'_Backstage\'!'+sheetBackstage.getRange(3+6*i, 4+k*3).getB1Notation()+'))');

        thisSheet.getRange(3, 6+5*k).setFormula('=CONCAT("Expenses "; TO_TEXT(\'_Backstage\'!' + rollA1Notation(4+6*i, 4+3*k) + '))');
        //thisSheet.getRange(3, 6+5*k).setFormula('=CONCAT("Expenses "; TO_TEXT(\'_Backstage\'!' + sheetBackstage.getRange(4+6*i, 4+3*k).getB1Notation() + '))');
      }
    }

    SpreadsheetApp.flush();
  } catch(err) {
    Logger.log('setupSpreadsheet/part=6 : ' + err.message);
    console.error("setupPart6_()", err);
    return true;
  }
}

/**
  * Install essential formulas; table 'Carteira', sheet '_Backstage'.
  */
function setupPart5_(spreadsheet, sheetBackstage, number_accounts) {
  try {
    var formulaSumIncome, formulaSumExpenses;
    var i, k;

    for(i = 0;  i < 12;  i++) {
      formulaSumIncome = '=';
      formulaSumExpenses = '=';

      {
        k = 0;
        formulaSumIncome += rollA1Notation(6+i*6,5+k*3); // Income
        //formulaSumIncome += sheetBackstage.getRange(6+i*6,5+k*3).getB1Notation(); // Income

        formulaSumExpenses += rollA1Notation(4+i*6,4+k*3); // Expenses
        //formulaSumExpenses += sheetBackstage.getRange(4+i*6,4+k*3).getB1Notation(); // Expenses
      }
      for(k = 1;  k < number_accounts;  k++) {
        formulaSumIncome += '+'+rollA1Notation(6+i*6,5+k*3);
        //formulaSumIncome += '+'+sheetBackstage.getRange(6+i*6,5+k*3).getB1Notation();

        formulaSumExpenses += '+'+rollA1Notation(4+i*6,4+k*3);
        //formulaSumExpenses += '+'+sheetBackstage.getRange(4+i*6,4+k*3).getB1Notation();
      }

      sheetBackstage.getRange(3+i*6, 2).setFormula(formulaSumIncome);
      sheetBackstage.getRange(5+i*6, 2).setFormula(formulaSumExpenses);
    }

    SpreadsheetApp.flush();
  } catch(err) {
    Logger.log('setupSpreadsheet/part=5 : ' + err.message);
    console.error("setupPart5_()", err);
    return true;
  }
}

/**
  * Insert formulas in Tags.
  */
function setupPart4_(spreadsheet, listNameMonths, number_accounts) {
  try {
    var sheetCreditCard = spreadsheet.getSheetByName('Cards');
    var formula, ranges1, ranges2;
    var listNameMonthsFull = AppsScriptGlobal.listNameMonth()[1];
    var vFormulas;
    var n1, n2, v;
    var i, k;

    n1 = spreadsheet.getSheetByName(listNameMonths[0]).getMaxRows();
    n2 = sheetCreditCard.getMaxRows() - 5;
    vFormulas = [
      [ ]
    ];
    ranges1 = [
      ['$H$5:$I', '$H$5:$H'],
      ['$M$5:$N', '$M$5:$M'],
      ['$R$5:$S', '$R$5:$R'],
      ['$W$5:$X', '$W$5:$W'],
      ['$AB$5:$AC', '$AB$5:$AB']
    ];

    ranges2 = [ ];
    for(i = 0;  i < 12;  i++) {
      ranges2.push( rollA1Notation(6,4+i*6, -1,2) );
      //ranges2.push(sheetCreditCard.getRange(6,4+i*6, n2,2).getB1Notation());
    }


    for(i = 0;  i < 12;  i++) {
      formula = '{\"'+listNameMonthsFull[i]+'\"; IF(\'_Settings\'!$B$7 > 0,';

      formula += 'LNESUMBYTAG($D1:$D;{';
      formula += '\''+listNameMonths[i]+'\'!$C$5:$D';
      formula += ';\'Cards\'!'+ranges2[i];
      for(k = 0;  k < number_accounts;  k++) {
        formula += ';\''+listNameMonths[i]+'\'!'+ranges1[k][0];
      }
      formula += '}),)}';

      vFormulas[0].push(formula);
      Utilities.sleep(137);
    }

    spreadsheet.getSheetByName('Tags').getRange(1,18).setFormula('{\"Average\"; IF(\'_Settings\'!$B$7 > 0, ARRAYFORMULA($S$2:$S/\'_Settings\'!B6),)}');
    spreadsheet.getSheetByName('Tags').getRange(1,5, 1,12).setFormulas(vFormulas);

    SpreadsheetApp.flush();
  } catch(err) {
    Logger.log('setupSpreadsheet/part=4 : ' + err.message);
    console.error("setupPart4_()", err);
    return true;
  }
}

/**
  * Trim the spreadsheet by deleting columns and rows not in use. Hide some sheets.
  */
function setupPart3_(spreadsheet, listNameMonths, numberLneAccount) {
  try {
    var numberLneAccount_D = 5 - numberLneAccount;
    var thisSheet, i;


    if(numberLneAccount !== 5) { /* ----- Ajuste de linhas e colunas --- */
      spreadsheet.getSheetByName('_Backstage').deleteColumns(4+numberLneAccount*3, 3*numberLneAccount_D);

      for(i = 0;  i < 12;  i++) {
        thisSheet = spreadsheet.getSheetByName(listNameMonths[i]);
        thisSheet.deleteColumns(6+numberLneAccount*5, 5*numberLneAccount_D);
      }
    }

    SpreadsheetApp.flush();
  } catch(err) {
    Logger.log('setupSpreadsheet/part=3 : ' + err.message);
    console.error("setupPart3_()", err);
    return true;
  }
}

/**
  *
  */
function setupPart2_(sheetBackstage, listAccountName, m, numberLneAccount) {
  try {
    if(numberLneAccount !== listAccountName.length) throw "Number numberLneAccount and listAccountName length are different.";
    var thisSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Jan');
    var dbAccountInfo;
    var newCell, auxString;
    var n, k;

    dbAccountInfo = [ ];
    auxString = randomString(11, "word");


    for(k = 0;  k < numberLneAccount;  k++) {
      newCell = {
        Id: auxString, // Id
        Name: listAccountName[k], // Name
        TimeA: m, // Time initial
        TimeZ: 11, // Time final
        Balance: 0, // Initial balance
        Header: [true, true, true, true] // Header options
      };

      sheetBackstage.getRange(1, 4+k*3).setValue(listAccountName[k]);
      thisSheet.getRange(1, 6+k*5).setValue(listAccountName[k]);

      dbAccountInfo.push(newCell);
    }

    setPropertiesService_('document', 'json', 'DB_ACCOUNT', dbAccountInfo);
    setPropertiesService_('document', 'json', 'DB_CARD', [ ]);

    for(k = 0;  k < dbAccountInfo.length;  k++) {
      auxString = optMainTables('GenerateRandomId');
      if(!auxString) throw "Error to update Id for tables."
      dbAccountInfo[k].Id = auxString;
    }

    setPropertiesService_('document', 'json', 'DB_ACCOUNT', dbAccountInfo);
  } catch(err) {
    Logger.log('setupSpreadsheet/part=2 : ' + err.message);
    console.error("setupPart2_()", err);
    return true;
  }
}


function setupPart1_(spreadsheet, sheetSettings, AddonSettings, dateToday) {
  try {
    var cell;


    {
      cell = [
        [ AddonSettings.FinancialYear ],
        [ "=IF(YEAR(TODAY()) = $B2; MONTH(TODAY()); IF(YEAR(TODAY()) < $B2; 0; 12))" ],
        [ AddonSettings.InitialMonth + 1 ],
        [ "=IF($B4 > $B3; 0; $B3-$B4+1)" ],
        [ "=IF(AND($B3 = 12; YEAR(TODAY()) <> $B2), $B5, MAX($B5-1, 0))" ],
        [ "=ROWS(\'Tags\'!$D1:$D)-2" ],
        [ "=COUNTIF(B12:B21,\"<>\")" ],
        [ "=RAND()" ]
      ];

      sheetSettings.getRange(2,2, 8,1)
        .setFormulas(cell);

      sheetSettings.getRange(12,2, 10)
        .setValue("");

      setPropertiesService_('document', 'number', 'LNE_VERSION', 0);
      setPropertiesService_('document', 'string', 'LN_VERSION', AppsScriptGlobal.SpreadsheetTemplateVersion());
      setPropertiesService_('document', 'number', 'number_accounts', AddonSettings.number_accounts);
    }
    {
      cell = {
        FinancialYear: AddonSettings.FinancialYear,
        InitialMonth: AddonSettings.InitialMonth,
        FinancialCalendar: 'null_',
        PostDayEvents: false,
        CashFlowEvents: false,
        OverrideZero: false,
        BlankLines: 100,
        ScreenResolution: 1
      };

      setPropertiesService_('document', 'json', 'user_settings', cell);
    }
    {
      setPropertiesService_('document', 'string', 'onOpenMainId', '');
      setPropertiesService_('document', 'string', 'onEditMainId', '');

      setPropertiesService_('document', 'string', 'atDateMainId', '');
      setPropertiesService_('document', 'string', 'dailyMainId', '');
      setPropertiesService_('document', 'string', 'weeklyMainId', '');

      createScriptAppTriggers_('document', 'onEditMainId', 'onEdit', 'onEdit_Main_');

      if(AddonSettings.FinancialYear < dateToday.FullYear) {
        createScriptAppTriggers_('document', 'weeklyMainId', 'onWeekDay', 'weekly_Main_', 2);
        setPropertiesService_('document', 'string', 'OperationMode', "passive");

      } else if(AddonSettings.FinancialYear == dateToday.FullYear) {
        createScriptAppTriggers_('document', 'dailyMainId', 'everyDays', 'daily_Main_', 1, 2);
        setPropertiesService_('document', 'string', 'OperationMode', "active");

      } else if(AddonSettings.FinancialYear > dateToday.FullYear) {
        createScriptAppTriggers_('document', 'onOpenMainId', 'onOpen', 'onOpen_Main_');
        createScriptAppTriggers_('document', 'weeklyMainId', 'onWeekDay', 'weekly_Main_', 2);
        setPropertiesService_('document', 'string', 'OperationMode', "passive");
      }
    }

    SpreadsheetApp.flush();
  } catch(err) {
    Logger.log('setupSpreadsheet/part=1 : ' + err.message);
    console.error("setupPart1_()", err);
    return true;
  }
}
