function showSetupAddon_() {
  var Ui = SpreadsheetApp.getUi();

  try {
    SpreadsheetApp.openById( AppsScriptGlobal.TemplateId() );
  } catch(err) {
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
    lock.waitLock(2000);
  } catch(err) {
    SpreadsheetApp.getUi().alert(
      "Add-on is busy",
      "A budget spreadsheet setup is in progress. Try again later.",
      SpreadsheetApp.getUi().ButtonSet.OK);
		console.warn("nodeControl_(): Wait lock time out.");
    return;
  }

	setup_(settings, list);

	setPropertiesService_("document", "string", "is_installed", "[ ]");
	showDialogSetupEnd();
	onOpen();

  try {
    var stats = {
      financial_year: Number(settings.FinancialYear),
      number_accounts: Number(settings.number_accounts)
    };
    console.info("add-on/Stats", stats);
  } catch(err) {
    console.error("setup_ui()/stats", err);
  }

	console.info("add-on/Install: Success.");
}

function setup_(settings, listAccountName) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

	settings.date_created = new Date().getTime();
  settings.FinancialYear = Number(settings.FinancialYear);
  settings.InitialMonth = Number(settings.InitialMonth);
  settings.number_accounts = Number(settings.number_accounts);

  console.time("add-on/Install");

  spreadsheet.rename(settings.SpreadsheetName);

  purgePropertiesService_("document");
  purgeScriptAppTriggers_();

  deleteAllSheets_();
  copySheetsFromTemplate_();
  if(sortSheetOrder_() !== -1) return;

  spreadsheet.setActiveSheet( spreadsheet.getSheetByName('Summary') );

	setup_ExecutePatial_(settings, listAccountName);

  var s = {
    AddonVersion: AppsScriptGlobal.AddonVersion(),
    AddonVersionName: AppsScriptGlobal.AddonVersionName(),
    TemplateVersion: AppsScriptGlobal.TemplateVersion(),
    TemplateVersionName: AppsScriptGlobal.TemplateVersionName()
  };
  setPropertiesService_("document", "json", "class_version", s);

  try {
    s = nodeControl_("sign");
    if(typeof s != "string") throw 1;
  } catch(err) {
    console.error("nodeControl_()/sign", err);
    return;
  }

  console.timeEnd("add-on/Install");
  return true;
}


function sortSheetOrder_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet;
  var list = [ "Summary", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Cards", "Cash Flow", "Tags", "Quick Actions", "_Settings", "_Backstage", "About" ];
  var i;

	i = 0;
	sheet = spreadsheet.getSheetByName(list[i]);
	if(!sheet) return;
	spreadsheet.setActiveSheet(sheet);
	spreadsheet.moveActiveSheet(i + 1);

  for(i = 13; i < list.length; i++) {
    sheet = spreadsheet.getSheetByName(list[i]);
		if(!sheet) return;
    spreadsheet.setActiveSheet(sheet);
    spreadsheet.moveActiveSheet(i + 1);
  }

	return -1;
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

  number_accounts = addonSettings.number_accounts;

  dateToday = {
    FullYear: dateToday.getFullYear(),
    Month: dateToday.getMonth()
  };

	setupPart3_(spreadsheet, number_accounts);
	setupPart1_(spreadsheet, sheetSettings, addonSettings, dateToday);
	setupPart2_(sheetBackstage, listAccountName, addonSettings.InitialMonth, number_accounts);
	setupPart4_(spreadsheet, number_accounts);
	setupPart5_(spreadsheet, sheetBackstage, number_accounts);
	setupPart6_(spreadsheet, sheetBackstage, number_accounts);
	setupPart7_(spreadsheet, dateToday, addonSettings.FinancialYear, addonSettings.InitialMonth, number_accounts);
	setupPart9_(sheetFinances, addonSettings.InitialMonth);
	setupPart10_(number_accounts, addonSettings.FinancialYear, addonSettings.InitialMonth);
	setupPart11_(spreadsheet, number_accounts);
}


function setupPart11_(spreadsheet, number_accounts) {
  var thisSheet;
  var vRange;
  var i, k;

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
      vRange.push( thisSheet.getRange(6, 1 + 6*i, 400, 5) );
      vRange.push( thisSheet.getRange(2, 1 + 6*i, 1, 3) );
    }
    thisSheet.protect().setUnprotectedRanges(vRange).setWarningOnly(true);
  }
  {
    thisSheet = spreadsheet.getSheetByName("Quick Actions");

    vRange = [ ];
    vRange.push( thisSheet.getRange(4, 2, 3, 1) );
    vRange.push( thisSheet.getRange(9, 2, 2, 1) );
    vRange.push( thisSheet.getRange(13, 1, 1, 2) );

    thisSheet.protect()
      .setUnprotectedRanges(vRange)
      .setWarningOnly(true);
  }
  {
    i = 0;
    while(i < 12) {
      thisSheet = spreadsheet.getSheetByName(MN_SHORT_[i]);
      vRange = [ ];

      for(k = 0;  k < 1+number_accounts;  k++) {
        vRange.push( thisSheet.getRange(5, 1 + 5*k, 400, 4) );
      }
      thisSheet.protect().setUnprotectedRanges(vRange).setWarningOnly(true);

      i++;
      Utilities.sleep(137);
    }
  }

  SpreadsheetApp.flush();
}


function setupPart10_(number_accounts, Y, m) {
  var sheetCashFlow = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Cash Flow');
  var d, s;
  var i, j, k;

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

  optMainTables('UpdateTableRef');
  SpreadsheetApp.flush();
}


function setupPart9_(sheetSummary, mm) {
  var chart, options;

  options = {
    0:{color:'#b7b7b7', type:'bars', labelInLegend:'Income'},
    1:{color:'#cccccc', type:'bars', labelInLegend:'Expenses'},
    2:{color:'#45818e', type:'bars', labelInLegend:'Income'},
    3:{color:'#e69138', type:'bars', labelInLegend:'Expenses'}
  };

  chart = sheetSummary.newChart()
    .addRange( sheetSummary.getRange('C25:H36') )
    .setChartType(Charts.ChartType.COMBO)
    .setPosition(24, 2, 0, 0)
    .setOption('mode', 'view')
    .setOption('legend', 'top')
    .setOption('focusTarget', 'category')
    .setOption('series', options)
    .setOption('height', 482)
    .setOption('width', 886);

  sheetSummary.insertChart( chart.build() );
  SpreadsheetApp.flush();
}


function setupPart7_(spreadsheet, dateToday, Y, m, number_accounts) {
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
    spreadsheet.getSheetByName('Cards').setTabColor('#e69138');
    spreadsheet.getSheetByName('Tags').setTabColor('#e69138');
    spreadsheet.getSheetByName('Quick Actions').setTabColor('#6aa84f');
    sheetBackstage.setTabColor('#cc0000').hideSheet();
    spreadsheet.getSheetByName('_Settings').setTabColor('#cc0000').hideSheet();
    spreadsheet.getSheetByName('About').setTabColor('#6aa84f').hideSheet();
  }

  sheetSummary.getRange('B2').setValue(Y+' | Year Summary');

  if(dateToday.FullYear == Y) {
    sheetTags.hideColumns(6, 12);

    for(i = 0;  i < 12;  i++) {
      if(i < dateToday.Month-1  ||  i > dateToday.Month+2) {
        spreadsheet.getSheetByName(MN_SHORT_[i]).hideSheet();
      } else {
        spreadsheet.getSheetByName(MN_SHORT_[i]).showSheet();
      }
    }

    if(dateToday.Month < 2) {
      sheetTags.showColumns(6, 4);
    } else {

      if(dateToday.Month == 11) {
        spreadsheet.getSheetByName(MN_SHORT_[9]).showSheet();
        dateToday.Month--;
      }
      sheetTags.showColumns(4 + dateToday.Month, 4);
    }
  }

  SpreadsheetApp.flush();
}


function setupPart6_(spreadsheet, sheetBackstage, number_accounts) {
	var sheetCards = spreadsheet.getSheetByName("Cards");
  var thisSheet;
	var header, str, c;
  var i, k;
  var h_, w_;

  h_ = AppsScriptGlobal.TableDimensions()["height"];
  w_ = AppsScriptGlobal.TableDimensions()["width"];

	c = 1 + w_ + w_*number_accounts;
	header = rollA1Notation(1, c + 1, 1, w_*11);

  for(i = 0;  i < 12;  i++) {
    thisSheet = spreadsheet.getSheetByName(MN_SHORT_[i]);

    thisSheet.getRange('A3').setFormula('CONCAT("Expenses "; TO_TEXT(\'_Backstage\'!$B' + (4+h_*i) + '))');

    for(k = 0;  k < number_accounts;  k++) {
      thisSheet.getRange(1, 8+5*k).setFormula('=BSINF(\'_Backstage\'!' + rollA1Notation(2+h_*i,8+w_*k, h_,2) + '; \'_Backstage\'!'+rollA1Notation(5+i*6, 4+k*3)+')');

      thisSheet.getRange(2, 6+5*k).setFormula('=CONCAT("Balance "; TO_TEXT(\'_Backstage\'!'+rollA1Notation(3+h_*i, 7+w_*k)+'))');

      thisSheet.getRange(3, 6+5*k).setFormula('=CONCAT("Expenses "; TO_TEXT(\'_Backstage\'!' + rollA1Notation(4+h_*i, 7+w_*k) + '))');
    }

		sheetCards.getRange(2, 1 + 6*i).setValue("All");

		str = "BSINFCARD(IF(" + rollA1Notation(2, 1 + 6*i) + " = \"\"; \"\"; ";
		str += "OFFSET(INDIRECT(ADDRESS(2; ";
		str += c + " + MATCH(" + rollA1Notation(2, 1 + 6*i) + "; ";
		str += "\'_Backstage\'!" + header + "; 0); 4; true; \"_Backstage\")); ";
		str += (h_*i) + "; 0; " + h_ + "; 1)))";
		sheetCards.getRange(2, 4 + i*6).setFormula(str);
  }

  SpreadsheetApp.flush();
}


function setupPart5_(spreadsheet, sheetBackstage, number_accounts) {
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
}


function setupPart4_(spreadsheet, number_accounts) {
  var sheet = spreadsheet.getSheetByName("Tags");
  var formula, formulas, rg, cd;
  var rgMonthTags, rgMonthCombo;
  var i, k;

  formulas = [ [ ] ];
  rgMonthTags = [ ];
  rgMonthCombo = [ ];
  for(k = 0; k < 1 + number_accounts; k++) {
    rgMonthTags[k] = rollA1Notation(5, 4 + 5*k, -1, 1);
    rgMonthCombo[k] = rollA1Notation(5, 3 + 5*k, -1, 2);
  }

  for(i = 0;  i < 12;  i++) {
    rg = "{\'" + MN_SHORT_[i] + "\'!" + rgMonthCombo[0];
    cd = "{\'" + MN_SHORT_[i] + "\'!" + rgMonthTags[0];

    for(k = 1;  k < 1 + number_accounts;  k++) {
      rg += "; \'" + MN_SHORT_[i] + "\'!" + rgMonthCombo[k];
      cd += "; \'" + MN_SHORT_[i] + "\'!" + rgMonthTags[k];
    }

    rg += "; \'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1, 2) + "}";
    cd += "; \'Cards\'!" + rollA1Notation(6, 5 + 6*i, -1, 1) + "}";

    formula = "{\"" + MN_FULL_[i] + "\"; ";
    formula += "IF(\'_Settings\'!$B$7 > 0; ";
    formula += "BSSUMBYTAG(TRANSPOSE($E$1:$E); IFERROR(FILTER(" + rg + "; ";
    formula += "NOT(ISBLANK(" + cd + "))); \"0\")); )}";

    formulas[0].push(formula);
  }

  sheet.getRange(1, 6, 1, 12).setFormulas(formulas);

  formula = "ARRAYFORMULA($T$2:$T/\'_Settings\'!B6)";
  formula = "IF(\'_Settings\'!$B$6 > 0; " + formula + "; ARRAYFORMULA($F$2:$F * 0))";
  formula = "IF(\'_Settings\'!$B$7 > 0; " + formula + "; \"\")";
  formula = "{\"Average\"; " + formula + "}";
  sheet.getRange(1, 19).setFormula(formula);

  formula = "IF(COLUMN(" + rollA1Notation(2, 5, -1, 12) + ") - 4 < \'_Settings\'!$B$4 + \'_Settings\'!$B$6; ROW(" + rollA1Notation(2, 5, -1) + "); 0)";
  formula = "IF(COLUMN(" + rollA1Notation(2, 5, -1, 12) + ") - 4 >= \'_Settings\'!$B$4; " + formula + "; 0)";
  formula = "ARRAYFORMULA(SUMIF(" + formula + "; ROW(" + rollA1Notation(2, 5, -1) + "); " + rollA1Notation(2, 5, -1) + "))";
  formula = "IF(\'_Settings\'!$B$6 > 0; " + formula + "; ARRAYFORMULA($F$2:$F * 0))";
  formula = "IF(\'_Settings\'!$B$7 > 0; " + formula + "; \"\")";
  formula = "{\"Total\"; " + formula + "}";
  sheet.getRange(1, 20).setFormula(formula);

  SpreadsheetApp.flush();
}


function setupPart3_(spreadsheet, number_accounts) {
  var diff, w_;

  diff = 5 - number_accounts;
  w_ = AppsScriptGlobal.TableDimensions()["width"];

  if(number_accounts !== 5) {
    spreadsheet.getSheetByName("_Backstage")
      .deleteColumns(7 + w_*number_accounts, w_*diff);

    for(var i = 0;  i < 12;  i++) {
      spreadsheet.getSheetByName(MN_SHORT_[i])
        .deleteColumns(6 + 5*number_accounts, 5*diff);
    }
  }

  SpreadsheetApp.flush();
}


function setupPart2_(sheetBackstage, listAcc, m, number_accounts) {
  if(number_accounts !== listAcc.length) throw "Number number_accounts and listAcc length are differ.";

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Jan');
  var db_acc, list_id;
  var newCell;
  var r, i, k, w_;

  w_ = AppsScriptGlobal.TableDimensions()["width"];

	r = "";
	db_acc = [ ];
	list_id = [ ];

  for(k = 0; k < number_accounts; k++) {
		i = 0;
		do {
			r = randomString(11, "word");
			i++;
		} while (list_id.indexOf(r) !== -1 && i < 99);

		if (i >= 99) throw "Could not generate unique ID for account.";

		list_id.push(r);

    newCell = {
      Id: r,
      Name: listAcc[i],
      TimeA: m,
      TimeZ: 11,
      Balance: 0
    };

    sheetBackstage.getRange(1, 7 + w_*k).setValue(listAcc[k]);
    sheet.getRange(1, 6 + k*5).setValue(listAcc[k]);

    db_acc.push(newCell);
  }

	setPropertiesService_('document', 'json', 'DB_CARD', [ ]);
  setPropertiesService_('document', 'json', 'DB_ACCOUNT', db_acc);
}


function setupPart1_(spreadsheet, sheetSettings, settings, dateToday) {
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
      [ "=" + settings.FinancialYear.formatLocaleSignal() ],
      [ "=IF(YEAR(TODAY()) = $B2; MONTH(TODAY()); IF(YEAR(TODAY()) < $B2; 0; 12))" ],
      [ "=" + (settings.InitialMonth + 1).formatLocaleSignal() ],
      [ "=IF($B4 > $B3; 0; $B3 - $B4 + 1)" ],
      [ "=IF(AND($B3 = 12; YEAR(TODAY()) <> $B2); $B5; MAX($B5 - 1; 0))" ],
      [ "=ROWS(\'Tags\'!$E1:$E) - 2" ],
      [ "=RAND()" ],
      [ "=COUNTIF(B11:B20; \"<>\")" ]
    ];

    sheetSettings.getRange(2, 2, 8, 1).setFormulas(cell);
  }
  {
    cell = {
      FinancialYear: settings.FinancialYear,
      InitialMonth: settings.InitialMonth,
      FinancialCalendar: "",
      PostDayEvents: false,
      CashFlowEvents: false,
      OverrideZero: false,
      SpreadsheetLocale: spreadsheet.getSpreadsheetLocale()
    };

    setPropertiesService_('document', 'json', 'user_settings', cell);
		setPropertiesService_('document', 'number', 'number_accounts', settings.number_accounts);
		setPropertiesService_('document', 'number', 'financial_year', settings.FinancialYear);
		setPropertiesService_('document', 'number', 'date_created', settings.date_created);
	}
	{
		cell = {
			date_created: settings.date_created,
			number_accounts: settings.number_accounts,
			financial_year: settings.FinancialYear
		};

		setPropertiesService_('document', 'obj', 'user_const_settings', cell);
	}
  {
    createScriptAppTriggers_('document', 'onEditMainId', 'onEdit', 'onEdit_Main_');

    if(settings.FinancialYear < dateToday.FullYear) {
      createScriptAppTriggers_('document', 'weeklyMainId', 'onWeekDay', 'weekly_Foo_', 2);
      setPropertiesService_('document', 'string', 'OperationMode', "passive");

    } else if(settings.FinancialYear == dateToday.FullYear) {
      createScriptAppTriggers_('document', 'dailyMainId', 'everyDays', 'daily_Main_', 1, 2);
      setPropertiesService_('document', 'string', 'OperationMode', "active");

    } else if(settings.FinancialYear > dateToday.FullYear) {
      createScriptAppTriggers_('document', 'weeklyMainId', 'onWeekDay', 'weekly_Bar_', 2);
      setPropertiesService_('document', 'string', 'OperationMode', "passive");
    }
  }

  SpreadsheetApp.flush();
}
