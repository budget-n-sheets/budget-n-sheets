function showSetupAddon_() {
	var Ui = SpreadsheetApp.getUi();

	try {
		SpreadsheetApp.openById( AppsScriptGlobal.TemplateId() );
	} catch (err) {
		console.warn("showSetupAddon_()", err);

		Ui.alert(
			"Budget n Sheets",
			"The add-on is updating. Try again later.",
			Ui.ButtonSet.OK);

		return;
	}

	if (getPropertiesService_("document", "", "is_installed")) {
		showDialogSetupEnd();
		onOpen();
		return;

	} else if (SpreadsheetApp.getActiveSpreadsheet().getFormUrl() != null) {
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
	if (button == Ui.Button.OK && text === s) {
		uninstall_();
		onOpen();
		console.info("add-on/deactivate");
		return true;
	}
}

function askReinstall() {
	if (!getPropertiesService_("document", "", "is_installed")) return;

	var financial_year = getUserConstSettings_('financial_year');
	var date = getSpreadsheetDate();

	purgeScriptAppTriggers_();

	createScriptAppTriggers_('document', 'onEditMainId', 'onEdit', 'onEdit_Main_');

	if (financial_year < date.getFullYear()) {
		setPropertiesService_('document', 'string', 'OperationMode', 'passive');
		createScriptAppTriggers_("document", "weeklyMainId", "onWeekDay", "weekly_Foo_", 2);

	} else if (financial_year === date.getFullYear()) {
		setPropertiesService_('document', 'string', 'OperationMode', 'active');
		createScriptAppTriggers_('document', 'dailyMainId', 'everyDays', 'daily_Main_', 1, 2);

	} else if (financial_year > date.getFullYear()) {
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

	for (var i = 0; i < list.length; i++) {
		ScriptApp.deleteTrigger(list[i]);
	}

	PropertiesService.getDocumentProperties().deleteAllProperties();
}


function setup_ui(settings, listAcc) {
	if (getPropertiesService_("document", "", "is_installed")) {
		showDialogSetupEnd();
		onOpen();
		return;
	}

	var lock = LockService.getDocumentLock();
	try {
		lock.waitLock(2000);
	} catch (err) {
		SpreadsheetApp.getUi().alert(
			"Add-on is busy",
			"A budget spreadsheet setup is in progress. Try again later.",
			SpreadsheetApp.getUi().ButtonSet.OK);
		console.warn("setup_ui(): Wait lock time out.");
		return;
	}

	setup_(settings, listAcc);

	setPropertiesService_("document", "string", "is_installed", "[ ]");
	showDialogSetupEnd();
	onOpen();

	try {
		var stats = {
			financial_year: Number(settings.financial_year),
			number_accounts: Number(settings.number_accounts)
		};
		console.info("add-on/Stats", stats);
	} catch (err) {
		console.error("setup_ui()/stats", err);
	}
}


var CONST_SETUP_SPREADSHEET_, CONST_SETUP_SETTINGS_;
var CONST_LIST_ES_SHEETS_, CONST_LIST_MN_SHEETS_;

function setup_(settings, listAcc) {
	var a;

	CONST_SETUP_SPREADSHEET_ = SpreadsheetApp.getActiveSpreadsheet();
	CONST_SETUP_SETTINGS_ = {
		date_created: new Date(),
		spreadsheet_name: settings.spreadsheet_name,
		spreadsheet_locale: CONST_SETUP_SPREADSHEET_.getSpreadsheetLocale(),
		financial_year: Number(settings.financial_year),
		init_month: Number(settings.init_month),
		number_accounts: Number(settings.number_accounts),
		list_acc: listAcc
	};

	console.time("add-on/Install");

	CONST_SETUP_SPREADSHEET_.rename(CONST_SETUP_SETTINGS_["spreadsheet_name"]);

	purgePropertiesService_("document");
	purgeScriptAppTriggers_();

	deleteAllSheets_();
	copySheetsFromTemplate_();
	if (sortSheetOrder_() !== -1) return;

	if (loadConstListSheets_() !== -1) return;

	CONST_SETUP_SPREADSHEET_.setActiveSheet(CONST_LIST_ES_SHEETS_["summary"]);

	setup_ExecutePatial_();

	a = {
		AddonVersion: AppsScriptGlobal.AddonVersion(),
		AddonVersionName: AppsScriptGlobal.AddonVersionName(),
		TemplateVersion: AppsScriptGlobal.TemplateVersion(),
		TemplateVersionName: AppsScriptGlobal.TemplateVersionName()
	};
	setPropertiesService_("document", "json", "class_version", a);

	a = nodeControl_("sign");
	if (a !== -1) throw 1;

	console.timeEnd("add-on/Install");

	CONST_SETUP_SPREADSHEET_ = null;
	CONST_SETUP_SETTINGS_ = null;
	CONST_LIST_ES_SHEETS_ = null;
	CONST_LIST_MN_SHEETS_ = null;
	return true;
}


function loadConstListSheets_() {
	var list = [
		[ "summary", "cards", "cash_flow", "tags", "quick_actions", "_settings", "_backstage", "about" ],
		[ "Summary", "Cards", "Cash Flow", "Tags", "Quick Actions", "_Settings", "_Backstage", "About" ]
	];
	var i;

	CONST_LIST_ES_SHEETS_ = { };
	CONST_LIST_MN_SHEETS_ = [ ];

	for (i = 0; i < list[0].length; i++) {
		CONST_LIST_ES_SHEETS_[list[0][i]] = CONST_SETUP_SPREADSHEET_.getSheetByName(list[1][i]);
		if (!CONST_LIST_ES_SHEETS_[list[0][i]]) return;
	}

	for (i = 0; i < MN_SHORT_.length; i++) {
		CONST_LIST_MN_SHEETS_[i] = CONST_SETUP_SPREADSHEET_.getSheetByName(MN_SHORT_[i]);
		if (!CONST_LIST_MN_SHEETS_[i]) return;
	}

	return -1;
}


function sortSheetOrder_() {
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var sheet;
	var list = [ "Summary", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Cards", "Cash Flow", "Tags", "Quick Actions", "_Settings", "_Backstage", "About" ];
	var i;

	i = 0;
	sheet = spreadsheet.getSheetByName(list[i]);
	if (!sheet) return;
	spreadsheet.setActiveSheet(sheet);
	spreadsheet.moveActiveSheet(i + 1);

	for (i = 13; i < list.length; i++) {
		sheet = spreadsheet.getSheetByName(list[i]);
		if (!sheet) return;
		spreadsheet.setActiveSheet(sheet);
		spreadsheet.moveActiveSheet(i + 1);
	}

	return -1;
}


function setup_ExecutePatial_() {
	var yyyy_mm = CONST_SETUP_SETTINGS_["date_created"];

	yyyy_mm = {
		yyyy: yyyy_mm.getFullYear(),
		mm: yyyy_mm.getMonth()
	};

	setupPart3_();
	setupPart1_(yyyy_mm);
	setupPart2_();
	setupPart4_();
	setupPart5_();
	setupPart6_();
	setupPart7_(yyyy_mm);
	setupPart9_();
	setupPart10_();
	setupPart11_();

	CONST_SETUP_SETTINGS_ = null;
}


function setupPart11_() {
	var thisSheet;
	var vRange;
	var i, k;

	{
		CONST_LIST_ES_SHEETS_["_backstage"].protect().setWarningOnly(true);
		CONST_LIST_ES_SHEETS_["_settings"].protect().setWarningOnly(true);
		CONST_LIST_ES_SHEETS_["about"].protect().setWarningOnly(true);
		CONST_LIST_ES_SHEETS_["summary"].protect().setWarningOnly(true);
	}
	{
		thisSheet = CONST_LIST_ES_SHEETS_["tags"];
		vRange = thisSheet.getRange(2, 1, 90, 5);
		thisSheet.protect()
			.setUnprotectedRanges([ vRange ])
			.setWarningOnly(true);
	}
	{
		thisSheet = CONST_LIST_ES_SHEETS_["cash_flow"];
		vRange = [ ];
		for (i = 0; i < 12; i++) {
			vRange.push( thisSheet.getRange(3,2+4*i, 31) );
			vRange.push( thisSheet.getRange(3,4+4*i, 31) );
		}
		thisSheet.protect().setUnprotectedRanges(vRange).setWarningOnly(true);
	}
	{
		thisSheet = CONST_LIST_ES_SHEETS_["cards"];
		vRange = [ ];
		for (i = 0; i < 12; i++) {
			vRange.push( thisSheet.getRange(6, 1 + 6*i, 400, 5) );
			vRange.push( thisSheet.getRange(2, 1 + 6*i, 1, 3) );
		}
		thisSheet.protect().setUnprotectedRanges(vRange).setWarningOnly(true);
	}
	{
		thisSheet = CONST_LIST_ES_SHEETS_["quick_actions"];

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
		while (i < 12) {
			thisSheet = CONST_LIST_MN_SHEETS_[i];
			vRange = [ ];

			for (k = 0; k < 1+CONST_SETUP_SETTINGS_["number_accounts"]; k++) {
				vRange.push( thisSheet.getRange(5, 1 + 5*k, 400, 4) );
			}
			thisSheet.protect().setUnprotectedRanges(vRange).setWarningOnly(true);

			i++;
			Utilities.sleep(137);
		}
	}

	SpreadsheetApp.flush();
}


function setupPart10_() {
	var yy = CONST_SETUP_SETTINGS_["financial_year"];
	var sheetCashFlow = CONST_LIST_ES_SHEETS_["cash_flow"];
	var d, s;
	var i, j, k;

	i=0;
	sheetCashFlow.getRange(3, 3+i*4).setFormula('=0');

	d = new Date(yy, i+1, 0).getDate();
	sheetCashFlow.getRange(4,3+i*4, d-1).setFormulaR1C1('=R[-1]C+RC[-1]');
	if (d < 31) {
		sheetCashFlow.getRange(3+d,2+i*4, 31-d,3).setBackground('#f3f3f3');
	}

	s = new Date(yy, 0, 1).getDay(); j=0;
	while (j < d) {
		switch (s) {
			case 0:
				sheetCashFlow.getRange(3+j,2, 1,3).setBackground('#d9ead3');
				s += 6; j += 6;
				break;
			case 6:
				sheetCashFlow.getRange(3+j,2, 1,3).setBackground('#d9ead3');
				s = 0; j++;
				break;
			default:
				s = (s+1)%7; j++;
				break;
		}
	}

	for (i = 1; i < 12; i++) {
		sheetCashFlow.getRange(3,3+i*4).setFormulaR1C1('=R['+(d-1)+']C[-4]+RC[-1]');

		d = new Date(yy, i+1, 0).getDate();
		sheetCashFlow.getRange(4,3+i*4, d-1).setFormulaR1C1('=R[-1]C+RC[-1]');
		if (d < 31) {
			sheetCashFlow.getRange(3+d,2+i*4, 31-d,3).setBackground('#f3f3f3');
		}

		s = new Date(yy, i, 1).getDay(); j=0;
		while (j < d) {
			switch (s) {
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


function setupPart9_() {
	var sheet = CONST_LIST_ES_SHEETS_["summary"];
	var chart, options;

	options = {
		0:{color:'#b7b7b7', type:'bars', labelInLegend:'Income'},
		1:{color:'#cccccc', type:'bars', labelInLegend:'Expenses'},
		2:{color:'#45818e', type:'bars', labelInLegend:'Income'},
		3:{color:'#e69138', type:'bars', labelInLegend:'Expenses'}
	};

	chart = sheet.newChart()
		.addRange( sheet.getRange('C25:H36') )
		.setChartType(Charts.ChartType.COMBO)
		.setPosition(24, 2, 0, 0)
		.setOption('mode', 'view')
		.setOption('legend', 'top')
		.setOption('focusTarget', 'category')
		.setOption('series', options)
		.setOption('height', 482)
		.setOption('width', 886);

	sheet.insertChart( chart.build() );
	SpreadsheetApp.flush();
}


function setupPart7_(yyyy_mm) {
	var sheetSummary = CONST_LIST_ES_SHEETS_["summary"];
	var sheet, md, i;

	sheetSummary.setTabColor('#e69138');
	CONST_LIST_ES_SHEETS_["cards"].setTabColor('#e69138');
	CONST_LIST_ES_SHEETS_["cash_flow"].setTabColor('#e69138');
	CONST_LIST_ES_SHEETS_["tags"].setTabColor('#e69138');
	CONST_LIST_ES_SHEETS_["quick_actions"].setTabColor('#6aa84f');
	CONST_LIST_ES_SHEETS_["_backstage"].setTabColor('#cc0000').hideSheet();
	CONST_LIST_ES_SHEETS_["_settings"].setTabColor('#cc0000').hideSheet();
	CONST_LIST_ES_SHEETS_["about"].setTabColor('#6aa84f').hideSheet();

	sheetSummary.getRange('B2').setValue(CONST_SETUP_SETTINGS_["financial_year"] + ' | Year Summary');

	if (yyyy_mm.yyyy == CONST_SETUP_SETTINGS_["financial_year"]) {
		md = getMonthDelta(yyyy_mm.mm);

		for (i = 0; i < CONST_SETUP_SETTINGS_["init_month"]; i++) {
			sheet = CONST_LIST_MN_SHEETS_[i];
			sheet.setTabColor('#b7b7b7');

			if (i < yyyy_mm.mm + md[0] || i > yyyy_mm.mm + md[1]) {
				sheet.hideSheet();
			}
		}

		for (; i < 12; i++) {
			sheet = CONST_LIST_MN_SHEETS_[i];

			if (i < yyyy_mm.mm + md[0] || i > yyyy_mm.mm + md[1]) {
				sheet.setTabColor('#a4c2f4');
				sheet.hideSheet();
			} else {
				sheet.setTabColor('#3c78d8');
			}
		}

		CONST_LIST_MN_SHEETS_[yyyy_mm.mm].setTabColor('#6aa84f');
		if (yyyy_mm.mm == 11) CONST_LIST_MN_SHEETS_[8].showSheet();
	} else {
		for (i = 0; i < CONST_SETUP_SETTINGS_["init_month"]; i++) {
			CONST_LIST_MN_SHEETS_[i].setTabColor('#b7b7b7');
		}
		for (; i < 12; i++) {
			CONST_LIST_MN_SHEETS_[i].setTabColor('#a4c2f4');
		}
	}

	SpreadsheetApp.flush();
}


function setupPart6_() {
	var sheetCards = CONST_LIST_ES_SHEETS_["cards"];
	var sheet, formula;
	var header, c;
	var i, k;
	var h_, w_;

	h_ = AppsScriptGlobal.TableDimensions()["height"];
	w_ = AppsScriptGlobal.TableDimensions()["width"];

	c = 1 + w_ + w_*CONST_SETUP_SETTINGS_["number_accounts"];
	header = rollA1Notation(1, c + 1, 1, w_*11);

	for (i = 0; i < 12; i++) {
		sheet = CONST_LIST_MN_SHEETS_[i];

		sheet.getRange('A3').setFormula('CONCAT("Expenses "; TO_TEXT(\'_Backstage\'!$B' + (4+h_*i) + '))');

		for (k = 0; k < CONST_SETUP_SETTINGS_["number_accounts"]; k++) {
			formula = "CONCATENATE(";
			formula += "\"Withdrawal: (\"; \'_Backstage\'!" + rollA1Notation(2 + h_*i, 9 + w_*k) + "; \") \"; TEXT(\'_Backstage\'!" + rollA1Notation(2 + h_*i, 8 + w_*k) + "; \"#,##0.00;-#,##0.00\"); \"\n\"; ";
			formula += "\"Deposit: (\"; \'_Backstage\'!" + rollA1Notation(3 + h_*i, 9 + w_*k) + "; \") \"; TEXT(\'_Backstage\'!" + rollA1Notation(3 + h_*i, 8 + w_*k) + "; \"#,##0.00;-#,##0.00\"); \"\n\"; ";
			formula += "\"Trf. in: (\"; \'_Backstage\'!" + rollA1Notation(4 + h_*i, 9 + w_*k) + "; \") \"; TEXT(\'_Backstage\'!" + rollA1Notation(4 + h_*i, 8 + w_*k) + "; \"#,##0.00;-#,##0.00\"); \"\n\"; ";
			formula += "\"Trf. out: (\"; \'_Backstage\'!" + rollA1Notation(5 + h_*i, 9 + w_*k) + "; \") \"; TEXT(\'_Backstage\'!" + rollA1Notation(5 + h_*i, 8 + w_*k) + "; \"#,##0.00;-#,##0.00\")";
			formula += ")";
			sheet.getRange(1, 8 + 5*k).setFormula(formula);

			sheet.getRange(2, 6 + 5*k).setFormula('CONCAT("Balance "; TO_TEXT(\'_Backstage\'!' + rollA1Notation(3 + h_*i, 7 + w_*k) + '))');
			sheet.getRange(3, 6 + 5*k).setFormula('CONCAT("Expenses "; TO_TEXT(\'_Backstage\'!' + rollA1Notation(4 + h_*i, 7 + w_*k) + '))');
		}

		sheetCards.getRange(2, 1 + 6*i).setValue("All");

		formula = "MATCH(" + rollA1Notation(2, 1 + 6*i) + "; \'_Backstage\'!" + header + "; 0)";
		formula = "INDIRECT(ADDRESS(2; " +  c + " + " + formula + "; 4; true; \"_Backstage\"))";
		formula = "OFFSET(" + formula + "; " + (h_*i) + "; 0; " + h_ + "; 1)";
		formula = "IF(" + rollA1Notation(2, 1 + 6*i) + " = \"\"; \"\"; " + formula + ")";
		formula = "BSINFCARD(" + formula + ")";

		sheetCards.getRange(2, 4 + i*6).setFormula(formula);
	}

	SpreadsheetApp.flush();
}


function setupPart5_() {
	var formulaSumIncome, formulaSumExpenses;
	var i, k;
	var h_, w_;

	h_ = AppsScriptGlobal.TableDimensions()["height"];
	w_ = AppsScriptGlobal.TableDimensions()["width"];

	for (i = 0; i < 12; i++) {
		formulaSumIncome = '=';
		formulaSumExpenses = '=';

		{
			k = 0;
			formulaSumIncome += rollA1Notation(6+h_*i, 8+w_*k);
			formulaSumExpenses += rollA1Notation(4+h_*i, 7+w_*k);
		}
		for (k = 1; k < CONST_SETUP_SETTINGS_["number_accounts"]; k++) {
			formulaSumIncome += '+'+rollA1Notation(6+h_*i, 8+w_*k);
			formulaSumExpenses += '+'+rollA1Notation(4+h_*i, 7+w_*k);
		}

		CONST_LIST_ES_SHEETS_["_backstage"].getRange(3+h_*i, 2).setFormula(formulaSumIncome);
		CONST_LIST_ES_SHEETS_["_backstage"].getRange(5+h_*i, 2).setFormula(formulaSumExpenses);
	}

	SpreadsheetApp.flush();
}


function setupPart4_() {
	var sheet = CONST_LIST_ES_SHEETS_["tags"];
	var formula, formulas, rg, cd;
	var rgMonthTags, rgMonthCombo;
	var i, k;

	formulas = [ [ ] ];
	rgMonthTags = [ ];
	rgMonthCombo = [ ];
	for (k = 0; k < 1 + CONST_SETUP_SETTINGS_["number_accounts"]; k++) {
		rgMonthTags[k] = rollA1Notation(5, 4 + 5*k, -1, 1);
		rgMonthCombo[k] = rollA1Notation(5, 3 + 5*k, -1, 2);
	}

	for (i = 0; i < 12; i++) {
		rg = "{\'" + MN_SHORT_[i] + "\'!" + rgMonthCombo[0];
		cd = "{\'" + MN_SHORT_[i] + "\'!" + rgMonthTags[0];

		for (k = 1; k < 1 + CONST_SETUP_SETTINGS_["number_accounts"]; k++) {
			rg += "; \'" + MN_SHORT_[i] + "\'!" + rgMonthCombo[k];
			cd += "; \'" + MN_SHORT_[i] + "\'!" + rgMonthTags[k];
		}

		rg += "; \'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1, 2) + "}";
		cd += "; \'Cards\'!" + rollA1Notation(6, 5 + 6*i, -1, 1) + "}";

		formula = "{\"" + MN_FULL_[i] + "\"; ";
		formula += "IF(\'_Settings\'!$B$7 > 0; ";
		formula += "BSSUMBYTAG(TRANSPOSE($E$1:$E); IFERROR(FILTER(" + rg + "; ";
		formula += "NOT(ISBLANK(" + cd + "))); \"\")); )}";

		formulas[0].push(formula);
	}

	sheet.getRange(1, 6, 1, 12).setFormulas(formulas);

	formula = "ARRAYFORMULA($T$2:$T/\'_Settings\'!B6)";
	formula = "IF(\'_Settings\'!$B$6 > 0; " + formula + "; ARRAYFORMULA($F$2:$F * 0))";
	formula = "IF(\'_Settings\'!$B$7 > 0; " + formula + "; \"\")";
	formula = "{\"Average\"; " + formula + "}";
	sheet.getRange(1, 19).setFormula(formula);

	formula = "IF(COLUMN(" + rollA1Notation(2, 6, -1, 12) + ") - 5 < \'_Settings\'!$B$4 + \'_Settings\'!$B$6; ROW(" + rollA1Notation(2, 6, -1) + "); 0)";
	formula = "IF(COLUMN(" + rollA1Notation(2, 6, -1, 12) + ") - 5 >= \'_Settings\'!$B$4; " + formula + "; 0)";
	formula = "ARRAYFORMULA(SUMIF(" + formula + "; ROW(" + rollA1Notation(2, 6, -1) + "); " + rollA1Notation(2, 6, -1) + "))";
	formula = "IF(\'_Settings\'!$B$6 > 0; " + formula + "; ARRAYFORMULA($F$2:$F * 0))";
	formula = "IF(\'_Settings\'!$B$7 > 0; " + formula + "; \"\")";
	formula = "{\"Total\"; " + formula + "}";
	sheet.getRange(1, 20).setFormula(formula);

	SpreadsheetApp.flush();
}


function setupPart3_() {
	var d, n, w_;

	w_ = AppsScriptGlobal.TableDimensions()["width"];
	n = CONST_SETUP_SETTINGS_["number_accounts"];
	d = 5 - n;

	if (n !== 5) {
		CONST_LIST_ES_SHEETS_["_backstage"].deleteColumns(7 + w_*n, w_*d);

		for (var i = 0; i < 12; i++) {
			CONST_LIST_MN_SHEETS_[i].deleteColumns(6 + 5*n, 5*d);
		}
	}

	SpreadsheetApp.flush();
}


function setupPart2_() {
	var list_acc = CONST_SETUP_SETTINGS_["list_acc"];
	if (CONST_SETUP_SETTINGS_["number_accounts"] !== list_acc.length) throw "Number number_accounts and list_acc length are differ.";

	var sheet = CONST_LIST_MN_SHEETS_[0];
	var db_acc, acc, list_id;
	var r, i, k, w_;

	w_ = AppsScriptGlobal.TableDimensions()["width"];

	r = "";
	db_acc = [ ];
	list_id = [ ];

	for (k = 0; k < CONST_SETUP_SETTINGS_["number_accounts"]; k++) {
		i = 0;
		do {
			r = randomString(11, "word");
			i++;
		} while (list_id.indexOf(r) !== -1 && i < 99);

		if (i >= 99) throw "Could not generate unique ID for account.";

		list_id.push(r);

		acc = {
			Id: r,
			Name: list_acc[k],
			TimeA: CONST_SETUP_SETTINGS_["init_month"],
			TimeZ: 11,
			Balance: 0
		};

		CONST_LIST_ES_SHEETS_["_backstage"].getRange(1, 7 + w_*k).setValue(list_acc[k]);
		sheet.getRange(1, 6 + k*5).setValue(list_acc[k]);

		db_acc.push(acc);
	}

	setPropertiesService_('document', 'json', 'DB_CARD', [ ]);
	setPropertiesService_('document', 'json', 'DB_ACCOUNT', db_acc);
}


function setupPart1_(yyyy_mm) {
	var cell;

	cell = CONST_LIST_ES_SHEETS_["_settings"].getRange(8, 2);

	cell.setValue(0.1);
	cell.setNumberFormat("0.0");
	SpreadsheetApp.flush();

	cell = cell.getDisplayValue();
	if ( /\./.test(cell) ) {
		setPropertiesService_("document", "", "decimal_separator", "[ ]");
	}

	cell = [
		[ "=" + CONST_SETUP_SETTINGS_["financial_year"].formatLocaleSignal() ],
		[ "=IF(YEAR(TODAY()) = $B2; MONTH(TODAY()); IF(YEAR(TODAY()) < $B2; 0; 12))" ],
		[ "=" + (CONST_SETUP_SETTINGS_["init_month"] + 1).formatLocaleSignal() ],
		[ "=IF($B4 > $B3; 0; $B3 - $B4 + 1)" ],
		[ "=IF(AND($B3 = 12; YEAR(TODAY()) <> $B2); $B5; MAX($B5 - 1; 0))" ],
		[ "=COUNTIF(\'Tags\'!$E1:$E; \"<>\") - 1" ],
		[ "=RAND()" ],
		[ "=COUNTIF(B11:B20; \"<>\")" ]
	];
	CONST_LIST_ES_SHEETS_["_settings"].getRange(2, 2, 8, 1).setFormulas(cell);

	cell = {
		InitialMonth: CONST_SETUP_SETTINGS_["init_month"],
		FinancialCalendar: "",
		PostDayEvents: false,
		CashFlowEvents: false,
		OverrideZero: false,
		SpreadsheetLocale: CONST_SETUP_SETTINGS_["spreadsheet_locale"]
	};
	setPropertiesService_('document', 'json', 'user_settings', cell);

	cell = {
		date_created: CONST_SETUP_SETTINGS_["date_created"].getTime(),
		number_accounts: CONST_SETUP_SETTINGS_["number_accounts"],
		financial_year: CONST_SETUP_SETTINGS_["financial_year"]
	};
	setPropertiesService_('document', 'obj', 'user_const_settings', cell);

	createScriptAppTriggers_('document', 'onEditMainId', 'onEdit', 'onEdit_Main_');
	if (CONST_SETUP_SETTINGS_["financial_year"] < yyyy_mm.yyyy) {
		createScriptAppTriggers_('document', 'weeklyMainId', 'onWeekDay', 'weekly_Foo_', 2);
		setPropertiesService_('document', 'string', 'OperationMode', "passive");

	} else if (CONST_SETUP_SETTINGS_["financial_year"] == yyyy_mm.yyyy) {
		createScriptAppTriggers_('document', 'dailyMainId', 'everyDays', 'daily_Main_', 1, 2);
		setPropertiesService_('document', 'string', 'OperationMode', "active");

	} else if (CONST_SETUP_SETTINGS_["financial_year"] > yyyy_mm.yyyy) {
		createScriptAppTriggers_('document', 'weeklyMainId', 'onWeekDay', 'weekly_Bar_', 2);
		setPropertiesService_('document', 'string', 'OperationMode', "passive");
	}

	SpreadsheetApp.flush();
}
