function showSetupAddon_() {
  var Ui = SpreadsheetApp.getUi();

  try {
    SpreadsheetApp.openById(AppsScriptGlobal.TemplateId());
  } catch(err) {
    Logger.log('showSetupAddon: ' + err.message);
    console.warn("showSetupAddon_()", err);

    Ui.alert(
      "Budget n Sheets",
      "The add-on is updating. Try again later.",
      Ui.ButtonSet.OK);

    return;
  }

  if(getPropertiesService_("document", "", "is_installed")) {
    showDialogSetupEnd();
    onOpen();
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
  if(!getPropertiesService_("document", "", "is_installed")) return;

  var FinancialYear = optAddonSettings_Get_('FinancialYear');
  var dateToday = getSpreadsheetDate();

  purgeScriptAppTriggers_();

  createScriptAppTriggers_('document', 'onEditMainId', 'onEdit', 'onEdit_Main_');

  if(FinancialYear < dateToday.getFullYear()) {
    setPropertiesService_('document', 'string', 'OperationMode', 'passive');
    createScriptAppTriggers_("document", "weeklyMainId", "onWeekDay", "weekly_Foo_", 2);

  } else if(FinancialYear === dateToday.getFullYear()) {
    setPropertiesService_('document', 'string', 'OperationMode', 'active');
    createScriptAppTriggers_('document', 'dailyMainId', 'everyDays', 'daily_Main_', 1, 2);

  } else if(FinancialYear > dateToday.getFullYear()) {
    setPropertiesService_('document', 'string', 'OperationMode', 'passive');
    createScriptAppTriggers_("document", "weeklyMainId", "onWeekDay", "weekly_Bar_", 2);
  }
}

function showDialogSetupEnd() {
  var htmlDialog = HtmlService.createTemplateFromFile("htmlSetupEnd")
    .evaluate()
    .setWidth(353)
    .setHeight(359);

  SpreadsheetApp.getUi()
    .showModalDialog(htmlDialog, "Add-on Budget n Sheets");
}


function uninstall_() {
  var list = ScriptApp.getUserTriggers( SpreadsheetApp.getActiveSpreadsheet() );

  for(var i = 0; i < list.length; i++) {
    ScriptApp.deleteTrigger(list[i]);
  }

  PropertiesService.getDocumentProperties().deleteAllProperties();
}


function setup_ui(settings, list) {
  if(getPropertiesService_("document", "", "is_installed")) {
    showDialogSetupEnd();
    onOpen();
    return;
  }

  var lock = LockService.getDocumentLock();
  try {
    lock.waitLock(200);
  } catch(err) {
    SpreadsheetApp.getUi().alert(
      "Add-on is busy",
      "A budget spreadsheet setup is in progress. Try again later.",
      SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  try {
    var s = setup_(settings, list);
  } catch(err) {
    console.error("setup_()", err);
  }

  if(!s) {
    uninstall_();
    showDialogErrorMessage();
    return;
  }

  setPropertiesService_("document", "string", "is_installed", "[ ]");
  showDialogSetupEnd();
  onOpen();

  Logger.log("add-on/Install: Success.");
  console.info("add-on/Install: Success.");
}

function setup_(addonSettings, listAccountName) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  addonSettings.FinancialYear = Number(addonSettings.FinancialYear);
  addonSettings.InitialMonth = Number(addonSettings.InitialMonth);
  addonSettings.number_accounts = Number(addonSettings.number_accounts);

  console.time("add-on/Install");

  spreadsheet.rename(addonSettings.SpreadsheetName);

  purgeScriptAppTriggers_();
  purgePropertiesService_();

  deleteAllSheets_();
  copySheetsFromTemplate_();
  sortSheetOrder_();

  spreadsheet.setActiveSheet( spreadsheet.getSheetByName('Summary') );

  try {
    var s = setup_ExecutePatial_(addonSettings, listAccountName);
  } catch(err) {
    console.error("setup_ExecutePatial_()", err);
  }

  if(!s) return;

  s = {
    AddonVersion: AppsScriptGlobal.AddonVersion(),
    AddonVersionName: AppsScriptGlobal.AddonVersionName(),
    TemplateVersion: AppsScriptGlobal.TemplateVersion()
  };
  setPropertiesService_("document", "json", "class_version", s);

  console.timeEnd("add-on/Install");
  return true;
}


function sortSheetOrder_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet;
  var list = [ "Summary", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Cards", "Cash Flow", "Tags", "Quick Actions", "_Settings", "_Backstage", "About" ];
  var i;

  for(var i = 0; i < list.length; i++) {
    sheet = spreadsheet.getSheetByName(list[i]);

    spreadsheet.setActiveSheet(sheet);
    spreadsheet.moveActiveSheet(i + 1);
  }
}


function setup_ExecutePatial_(addonSettings, listAccountName) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet(),
      sheetFinances = spreadsheet.getSheetByName('Summary'),
      sheetBackstage = spreadsheet.getSheetByName('_Backstage'),
      sheetSettings = spreadsheet.getSheetByName('_Settings');
  var dateToday = getSpreadsheetDate();
  var number_accounts;
  var chk;

  if(!sheetFinances) return;
  if(!sheetBackstage) return;
  if(!sheetSettings) return;

  listNameMonths = AppsScriptGlobal.listNameMonth()[0];
  numberLneAccount = addonSettings.number_accounts;

  dateToday = {
    FullYear: dateToday.getFullYear(),
    Month: dateToday.getMonth()
  };


  chk = setupPart3_(spreadsheet, listNameMonths, numberLneAccount);
  if(chk) return;

  chk = setupPart1_(spreadsheet, sheetSettings, addonSettings, dateToday);
  if(chk) return;

  chk = setupPart2_(sheetBackstage, listAccountName, addonSettings.InitialMonth, numberLneAccount);
  if(chk) return;


  chk = setupPart4_(spreadsheet, listNameMonths, numberLneAccount);
  if(chk) return;


  chk = setupPart5_(spreadsheet, sheetBackstage, numberLneAccount);
  if(chk) return;
  chk = setupPart6_(spreadsheet, sheetBackstage, listNameMonths, numberLneAccount);
  if(chk) return;

  chk = setupPart7_(spreadsheet, dateToday, addonSettings.FinancialYear, addonSettings.InitialMonth, listNameMonths, numberLneAccount);
  if(chk) return;


  chk = setupPart9_(sheetFinances, addonSettings.InitialMonth);
  if(chk) return;


  chk = setupPart10_(numberLneAccount, addonSettings.FinancialYear, addonSettings.InitialMonth);
  if(chk) return;


  chk = setupPart11_(spreadsheet, listNameMonths, numberLneAccount);
  if(chk) return;

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
    var chart, options;
    var list, i;

    list = AppsScriptGlobal.listNameMonth()[1];
    options = {
      0:{color:'#b7b7b7', type:'bars', labelInLegend:'Income'},
      1:{color:'#cccccc', type:'bars', labelInLegend:'Expenses'},
      2:{color:'#45818e', type:'bars', labelInLegend:'Income'},
      3:{color:'#e69138', type:'bars', labelInLegend:'Expenses'}
    };

    sheetSummary.getRange(25, 3, 12, 7).setValue(null);
    for(i = 0;  i < mm;  i++) {
      sheetSummary.getRange(25 + i, 3).setValue(list[i]);
      sheetSummary.getRange(25 + i, 4).setFormulaR1C1('=R[-14]C');
      sheetSummary.getRange(25 + i, 5).setFormulaR1C1('=-R[-14]C[1]');
    }
    for(;  i < 12;  i++) {
      sheetSummary.getRange(25 + i, 3).setValue(list[i]);
      sheetSummary.getRange(25 + i, 6).setFormulaR1C1('=R[-14]C[-2]');
      sheetSummary.getRange(25 + i, 7).setFormulaR1C1('=-R[-14]C[-1]');
    }

    if(mm == 0) {
      sheetSummary.getRange(25, 4, 1, 2).setValue(0);
    }

    chart = sheetSummary.newChart()
      .addRange( sheetSummary.getRange('C25:H36') )
      .setChartType(Charts.ChartType.COMBO)
      .setPosition(24, 2, 0, 0)
      .setOption('mode', 'view')
      .setOption('legend', 'none')
      .setOption('theme', 'maximized')
      .setOption('focusTarget', 'category')
      .setOption('series', options)
      .setOption('height', 335)
      .setOption('width', 886);

    sheetSummary.insertChart( chart.build() );
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
        sheetSummary = spreadsheet.getSheetByName('Summary'),
        sheetBackstage = spreadsheet.getSheetByName("_Backstage");
    var matrixFormulas;
    var c, i, h_;

    h_ = AppsScriptGlobal.TableDimensions()["height"];

    {
      sheetSummary.setTabColor('#e69138');
      foo_ColorTabs_();
      spreadsheet.getSheetByName('Cash Flow').setTabColor('#e69138');
      spreadsheet.getSheetByName('Cards').setTabColor('#e69138').hideSheet();
      spreadsheet.getSheetByName('Tags').setTabColor('#e69138');
      spreadsheet.getSheetByName('Quick Actions').setTabColor('#6aa84f');
      sheetBackstage.setTabColor('#cc0000').hideSheet();
      spreadsheet.getSheetByName('_Settings').setTabColor('#cc0000').hideSheet();
      spreadsheet.getSheetByName('About').hideSheet();
    }

    sheetSummary.getRange('B2').setValue(Y+' | Year Summary');
    if(m > 0) {
      c = sheetBackstage.getMaxColumns();
      sheetBackstage.getRange(2, 1, h_ * m, c)
        .setFontColor('#b7b7b7');
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
    var h_, w_;

    h_ = AppsScriptGlobal.TableDimensions()["height"];
    w_ = AppsScriptGlobal.TableDimensions()["width"];

    for(i = 0;  i < 12;  i++) {
      thisSheet = spreadsheet.getSheetByName(listNameMonths[i]);

      thisSheet.getRange('A3').setFormula('CONCAT("Expenses "; TO_TEXT(\'_Backstage\'!$B' + (4+h_*i) + '))');

      for(k = 0;  k < number_accounts;  k++) {
        thisSheet.getRange(1, 8+5*k).setFormula('=BSINF(\'_Backstage\'!' + rollA1Notation(2+h_*i,8+w_*k, h_,2) + '; \'_Backstage\'!'+rollA1Notation(5+i*6, 4+k*3)+')');

        thisSheet.getRange(2, 6+5*k).setFormula('=CONCAT("Balance "; TO_TEXT(\'_Backstage\'!'+rollA1Notation(3+h_*i, 7+w_*k)+'))');

        thisSheet.getRange(3, 6+5*k).setFormula('=CONCAT("Expenses "; TO_TEXT(\'_Backstage\'!' + rollA1Notation(4+h_*i, 7+w_*k) + '))');
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
    var h_, w_;

    h_ = AppsScriptGlobal.TableDimensions()["height"];
    w_ = AppsScriptGlobal.TableDimensions()["width"];

    for(i = 0;  i < 12;  i++) {
      formulaSumIncome = '=';
      formulaSumExpenses = '=';

      {
        k = 0;
        formulaSumIncome += rollA1Notation(6+h_*i, 8+w_*k);
        formulaSumExpenses += rollA1Notation(4+h_*i, 7+w_*k);
      }
      for(k = 1;  k < number_accounts;  k++) {
        formulaSumIncome += '+'+rollA1Notation(6+h_*i, 8+w_*k);
        formulaSumExpenses += '+'+rollA1Notation(4+h_*i, 7+w_*k);
      }

      sheetBackstage.getRange(3+h_*i, 2).setFormula(formulaSumIncome);
      sheetBackstage.getRange(5+h_*i, 2).setFormula(formulaSumExpenses);
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
    var formula, ranges2, rg, cd;
    var rgMonthTags, rgMonthCombo, rgCardsTags, rgCardsCombo;
    var listNameMonthsFull = AppsScriptGlobal.listNameMonth()[1];
    var vFormulas;
    var n1, n2, v;
    var i, k;

    n1 = spreadsheet.getSheetByName(listNameMonths[0]).getMaxRows();
    n2 = sheetCreditCard.getMaxRows() - 5;
    vFormulas = [
      [ ]
    ];

    rgMonthTags = [ ];
    rgMonthCombo = [ ];
    for(k = 0; k < 1 + number_accounts; k++) {
      rgMonthTags[k] = rollA1Notation(5, 4 + 5*k, -1, 1);
      rgMonthCombo[k] = rollA1Notation(5, 3 + 5*k, -1, 2);
    }

    rgCardsTags = [ ];
    rgCardsCombo = [ ];
    for(i = 0;  i < 12;  i++) {
      rgCardsTags[i] = rollA1Notation(6, 5 + 6*i, -1, 1);
      rgCardsCombo[i] = rollA1Notation(6, 4 + 6*i, -1, 2);
    }

    for(i = 0;  i < 12;  i++) {
      k = 0;
      rg = "{\'" + listNameMonths[i] + "\'!" + rgMonthCombo[0];
      cd = "{\'" + listNameMonths[i] + "\'!" + rgMonthTags[0];

      for(k++;  k < 1 + number_accounts;  k++) {
        rg += "; \'" + listNameMonths[i] + "\'!" + rgMonthCombo[k];
        cd += "; \'" + listNameMonths[i] + "\'!" + rgMonthTags[k];
      }

      rg += "; \'Cards\'!" + rgCardsCombo[i];
      rg += "}";

      cd += "; \'Cards\'!" + rgCardsTags[i];
      cd += "}";

      formula = "{\"" + listNameMonthsFull[i] + "\"; ";
      formula += "IF(\'_Settings\'!$B$7 > 0; ";
      formula += "BSSUMBYTAG(TRANSPOSE($D$1:$D); IFERROR(FILTER(" + rg + "; ";
      formula += "NOT(ISBLANK(" + cd + "))); \"0\")); )}";

      vFormulas[0].push(formula);
    }

    spreadsheet.getSheetByName('Tags').getRange(1,18).setFormula('{\"Average\"; IF(\'_Settings\'!$B$7 > 0; ARRAYFORMULA($S$2:$S/\'_Settings\'!B6); )}');
    spreadsheet.getSheetByName('Tags').getRange(1,5, 1,12).setFormulas(vFormulas);
    spreadsheet.getSheetByName("Tags").getRange(1, 19).setFormula("{\"Total\"; IF(\'_Settings\'!$B$7 > 0; ARRAYFORMULA(SUMIF(IF(COLUMN("+rollA1Notation(2, 5, -1, 12)+"); ROW("+rollA1Notation(2, 5, -1)+"));ROW("+rollA1Notation(2, 5, -1)+") ;"+rollA1Notation(2, 5)+")); )}");

    SpreadsheetApp.flush();
  } catch(err) {
    Logger.log('setupSpreadsheet/part=4 : ' + err.message);
    console.error("setupPart4_()", err);
    return true;
  }
}


function setupPart3_(spreadsheet, listNameMonths, numberLneAccount) {
  try {
    var diff, w_;

    diff = 5 - numberLneAccount;
    w_ = AppsScriptGlobal.TableDimensions()["width"];

    if(numberLneAccount !== 5) {
      spreadsheet.getSheetByName("_Backstage")
        .deleteColumns(7 + w_*numberLneAccount, w_*diff);

      for(var i = 0;  i < 12;  i++) {
        spreadsheet.getSheetByName(listNameMonths[i])
          .deleteColumns(6 + 5*numberLneAccount, 5*diff);
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
    var n, k, w_;

    w_ = AppsScriptGlobal.TableDimensions()["width"];

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

      sheetBackstage.getRange(1, 7+w_*k).setValue(listAccountName[k]);
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
      cell = sheetSettings.getRange(8, 2);

      cell.setValue(0.1);
      cell.setNumberFormat("0.0");
      SpreadsheetApp.flush();

      cell = cell.getDisplayValue();
      if( /\./.test(cell) ) {
        setPropertiesService_("document", "", "decimal_separator", "[ ]");
      }
    }
    {
      cell = [
        [ "="+AddonSettings.FinancialYear.formatLocaleSignal() ],
        [ "=IF(YEAR(TODAY()) = $B2; MONTH(TODAY()); IF(YEAR(TODAY()) < $B2; 0; 12))" ],
        [ "="+(AddonSettings.InitialMonth + 1).formatLocaleSignal() ],
        [ "=IF($B4 > $B3; 0; $B3-$B4+1)" ],
        [ "=IF(AND($B3 = 12; YEAR(TODAY()) <> $B2); $B5; MAX($B5-1; 0))" ],
        [ "=ROWS(\'Tags\'!$D1:$D)-2" ],
        [ "=RAND()" ],
        [ "=COUNTIF(B11:B20; \"<>\")" ]
      ];

      sheetSettings.getRange(2, 2, 8, 1).setFormulas(cell);
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
        ScreenResolution: 1,
        SpreadsheetLocale: spreadsheet.getSpreadsheetLocale()
      };

      setPropertiesService_('document', 'json', 'user_settings', cell);
      setPropertiesService_('document', 'number', 'number_accounts', AddonSettings.number_accounts);
    }
    {
      createScriptAppTriggers_('document', 'onEditMainId', 'onEdit', 'onEdit_Main_');

      if(AddonSettings.FinancialYear < dateToday.FullYear) {
        createScriptAppTriggers_('document', 'weeklyMainId', 'onWeekDay', 'weekly_Foo_', 2);
        setPropertiesService_('document', 'string', 'OperationMode', "passive");

      } else if(AddonSettings.FinancialYear == dateToday.FullYear) {
        createScriptAppTriggers_('document', 'dailyMainId', 'everyDays', 'daily_Main_', 1, 2);
        setPropertiesService_('document', 'string', 'OperationMode', "active");

      } else if(AddonSettings.FinancialYear > dateToday.FullYear) {
        createScriptAppTriggers_('document', 'weeklyMainId', 'onWeekDay', 'weekly_Bar_', 2);
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
