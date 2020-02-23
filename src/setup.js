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


function askResetProtection() {
	return;

	var lock = LockService.getDocumentLock();
	try {
		lock.waitLock(200);
	} catch (err) {
		return;
	}

	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var sheet, ranges, range;
	var protections, protection;
	var n, i, j, k;

	number_accounts = getUserConstSettings_('number_accounts');

	for (i = 0; i < 12; i++) {
		sheet = spreadsheet.getSheetByName(MN_SHORT_[i]);
		if (!sheet) continue;

		n = sheet.getMaxRows() - 4;
		if (n < 1) continue;
		if (sheet.getMaxColumns() < 5*(1 + number_accounts)) continue;

		protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
		for (j = 0; j < protections.length; j++) {
		  protection = protections[j];
		  if (protection.canEdit()) protection.remove();
		}

		ranges = [ ];
		for (k = 0; k < 1 + number_accounts; k++) {
			range = sheet.getRange(5, 1 + 5*k, n, 4);
			ranges.push(range);
		}

		sheet.protect()
			.setUnprotectedRanges(ranges)
			.setWarningOnly(true);
	}


	sheet = spreadsheet.getSheetByName("Cards");

	if (sheet) n = sheet.getMaxRows() - 5;
	else n = -1;

	if (n > 0 && sheet.getMaxColumns() >= 72) {
		protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
		for (j = 0; j < protections.length; j++) {
		  protection = protections[j];
		  if (protection.canEdit()) protection.remove();
		}

		ranges = [ ];

		for (i = 0; i < 12; i++) {
			range = sheet.getRange(6, 1 + 6*i, n, 5);
			ranges.push(range);

			range = sheet.getRange(2, 1 + 6*i, 1, 3);
			ranges.push(range);
		}

		sheet.protect()
			.setUnprotectedRanges(ranges)
			.setWarningOnly(true);
	}


	sheet = spreadsheet.getSheetByName("Tags");

	if (sheet) n = sheet.getMaxRows() - 1;
	else n = -1;

	if (n > 0) {
		protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
		for (j = 0; j < protections.length; j++) {
		  protection = protections[j];
		  if (protection.canEdit()) protection.remove();
		}

		range = sheet.getRange(2, 1, n, 5);
		sheet.protect()
			.setUnprotectedRanges([ range ])
			.setWarningOnly(true);
	}

	lock.releaseLock();
}


function askReinstall() {
	if (!getPropertiesService_("document", "", "is_installed")) return;

	var financial_year = getUserConstSettings_('financial_year');
	var date = getSpreadsheetDate();
	var d;

	purgeScriptAppTriggers_();

	createScriptAppTriggers_('document', 'onEditMainId', 'onEdit', 'onEdit_Main_');

	if (financial_year < date.getFullYear()) {
		setPropertiesService_('document', 'string', 'OperationMode', 'passive');
		createScriptAppTriggers_("document", "weeklyMainId", "onWeekDay", "weekly_Foo_", 2);

	} else if (financial_year === date.getFullYear()) {
		setPropertiesService_('document', 'string', 'OperationMode', 'active');
		createScriptAppTriggers_('document', 'dailyMainId', 'everyDays', 'daily_Main_', 1, 2);

	} else if (financial_year > date.getFullYear()) {
		d = new Date(financial_year, 0, 2);
		d = d.getDay();
		setPropertiesService_('document', 'string', 'OperationMode', 'passive');
		createScriptAppTriggers_("document", "weeklyMainId", "onWeekDay", "weekly_Bar_", d);
	}
}


function uninstall_() {
	var list = ScriptApp.getUserTriggers( SpreadsheetApp.getActiveSpreadsheet() );

	for (var i = 0; i < list.length; i++) {
		ScriptApp.deleteTrigger(list[i]);
	}

	PropertiesService.getDocumentProperties().deleteAllProperties();

	console.info("add-on/uninstall");
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

		consoleLog_('warn', 'setup_ui(): Wait lock time out.()', err);
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
		consoleLog_('error', 'setup_ui()/stats', err);
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

	console.time("add-on/install");

	CONST_SETUP_SPREADSHEET_.rename(CONST_SETUP_SETTINGS_["spreadsheet_name"]);

	purgePropertiesService_("document");
	purgeScriptAppTriggers_();

	deleteAllSheets_();
	copySheetsFromTemplate_();

	if (loadConstListSheets_() !== -1) return;

	CONST_SETUP_SPREADSHEET_.setActiveSheet(CONST_LIST_ES_SHEETS_["summary"]);

	setup_ExecutePatial_();

	try {
		a = AppsScriptGlobal.CoolGallery();
		getCoolSheet_(a["tags"]);
		coolTags_(a["tags"]);
	} catch (err) {
		consoleLog_('error', '', err);
	}

	a = {
		script: AppsScriptGlobal.script_version()["number"],
		template: AppsScriptGlobal.template_version()["number"]
	};
	setPropertiesService_('document', 'json', 'class_version2', a);

	a = nodeControl_("sign");
	if (a !== -1) throw 1;

	CONST_SETUP_SPREADSHEET_.setActiveSheet(CONST_LIST_ES_SHEETS_["summary"]);
	console.timeEnd("add-on/install");

	CONST_SETUP_SPREADSHEET_ = null;
	CONST_SETUP_SETTINGS_ = null;
	CONST_LIST_ES_SHEETS_ = null;
	CONST_LIST_MN_SHEETS_ = null;
	return true;
}


function loadConstListSheets_() {
	console.time('add-on/setup/load');
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

	console.timeEnd('add-on/setup/load');
	return -1;
}


function sortSheetOrder_() {
	console.time('add-on/setup/sort-sheets');
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

	console.timeEnd('add-on/setup/sort-sheets');
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
	// setupPart11_();

	CONST_SETUP_SETTINGS_ = null;
}


function setupPart11_() {
	console.time('add-on/setup/part11');
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
	console.timeEnd('add-on/setup/part11');
}


function setupPart10_() {
	console.time('add-on/setup/part10');
	var sheet = CONST_LIST_ES_SHEETS_["cash_flow"];
	var yyyy = CONST_SETUP_SETTINGS_["financial_year"];
	var num_acc = CONST_SETUP_SETTINGS_["number_accounts"];
	var ranges, b_f3f3f3, b_d9ead3;
	var mm, d, s, h_;
	var i, j, k;

	if (yyyy == 2020) {
		ranges = [ "C4:C33", "G4:G31", "K4:K33", "O4:O32", "S4:S33", "W4:W32", "AA4:AA33", "AE4:AE33", "AI4:AI32", "AM4:AM33", "AQ4:AQ32", "AU4:AU33" ];

		b_f3f3f3 = [ "F32:H33", "N33:P33", "V33:X33", "AH33:AJ33", "AP33:AR33" ];

		b_d9ead3 = [ "B6:D6", "B7:D7", "B13:D13", "B14:D14", "B20:D20", "B21:D21", "B27:D27", "B28:D28", "F3:H3", "F4:H4", "F10:H10", "F11:H11", "F17:H17", "F18:H18", "F24:H24", "F25:H25", "F31:H31", "J3:L3", "J9:L9", "J10:L10", "J16:L16", "J17:L17", "J23:L23", "J24:L24", "J30:L30", "J31:L31", "N6:P6", "N7:P7", "N13:P13", "N14:P14", "N20:P20", "N21:P21", "N27:P27", "N28:P28", "R4:T4", "R5:T5", "R11:T11", "R12:T12", "R18:T18", "R19:T19", "R25:T25", "R26:T26", "R32:T32", "R33:T33", "V8:X8", "V9:X9", "V15:X15", "V16:X16", "V22:X22", "V23:X23", "V29:X29", "V30:X30", "Z6:AB6", "Z7:AB7", "Z13:AB13", "Z14:AB14", "Z20:AB20", "Z21:AB21", "Z27:AB27", "Z28:AB28", "AD3:AF3", "AD4:AF4", "AD10:AF10", "AD11:AF11", "AD17:AF17", "AD18:AF18", "AD24:AF24", "AD25:AF25", "AD31:AF31", "AD32:AF32", "AH7:AJ7", "AH8:AJ8", "AH14:AJ14", "AH15:AJ15", "AH21:AJ21", "AH22:AJ22", "AH28:AJ28", "AH29:AJ29", "AL5:AN5", "AL6:AN6", "AL12:AN12", "AL13:AN13", "AL19:AN19", "AL20:AN20", "AL26:AN26", "AL27:AN27", "AL33:AN33", "AP3:AR3", "AP9:AR9", "AP10:AR10", "AP16:AR16", "AP17:AR17", "AP23:AR23", "AP24:AR24", "AP30:AR30", "AP31:AR31", "AT7:AV7", "AT8:AV8", "AT14:AV14", "AT15:AV15", "AT21:AV21", "AT22:AV22", "AT28:AV28", "AT29:AV29" ];

		for (i = 0; i < 12; i++) {
			d = new Date(yyyy, 1 + i, 0).getDate();
			sheet.getRange(3, 3 + 4*i + 4).setFormulaR1C1('=R[' + (d - 1) + ']C[-4] + RC[-1]');
		}
	} else {
		ranges = [ ];
		b_f3f3f3 = [ ];
		b_d9ead3 = [ ];

		i = 0;
		d = new Date(yyyy, 1 + i, 0).getDate();
		ranges.push([ rollA1Notation(4, 3 + 4*i, d - 1) ]);
		if (d < 31) {
			b_f3f3f3.push([ rollA1Notation(3 + d, 2 + 4*i, 31 - d, 3) ]);
		}

		j = 0;
		s = new Date(yyyy, 0, 1).getDay();
		while (j < d) {
			switch (s) {
				case 0:
					b_d9ead3.push([ rollA1Notation(3 + j, 2, 1, 3) ]);
					s += 6;
					j += 6;
					break;
				case 6:
					b_d9ead3.push([ rollA1Notation(3 + j, 2, 1, 3) ]);
					s = 0;
					j++;
					break;
				default:
					s = (s + 1)%7;
					j++;
					break;
			}
		}

		for (i = 1; i < 12; i++) {
			sheet.getRange(3, 3 + 4*i).setFormulaR1C1('=R[' + (d - 1) + ']C[-4] + RC[-1]');

			d = new Date(yyyy, 1 + i, 0).getDate();
			ranges.push([ rollA1Notation(4, 3 + 4*i, d - 1) ]);
			if (d < 31) {
				b_f3f3f3.push([ rollA1Notation(3 + d, 2 + 4*i, 31 - d, 3) ]);
			}

			j = 0;
			s = new Date(yyyy, i, 1).getDay();
			while (j < d) {
				switch (s) {
					case 0:
						b_d9ead3.push([ rollA1Notation(3 + j, 2 + 4*i, 1, 3) ]);
						s = 6;
						j += 6;
						break;
					case 6:
						b_d9ead3.push([ rollA1Notation(3 + j, 2 + 4*i, 1, 3) ]);
						s = 0;
						j++;
						break;
					default:
						s = (s + 1)%7;
						j++;
						break;
				}
			}
		}
	}

	sheet.getRangeList(ranges).setFormulaR1C1('=R[-1]C + RC[-1]');
	sheet.getRangeList(b_f3f3f3).setBackground('#f3f3f3');
	sheet.getRangeList(b_d9ead3).setBackground('#d9ead3');

	h_ = TABLE_DIMENSION_.height;
	mm = CONST_SETUP_SETTINGS_["init_month"];
	ranges = [ "G", "L", "Q", "V", "AA" ];

	sheet.getRange(3, 3).setFormula('=0 + B3');

	if (mm == 0) {
		s = "=0 + B3";
	} else {
		s = "=" + rollA1Notation(3 + (d - 1), 3 + 4*mm - 4) + " + " + rollA1Notation(3, 3 + 4*mm - 1);
	}

	for (k = 0; k < num_acc; k++) {
		 s += " + \'_Backstage\'!" + ranges[k] + (2 + h_*mm);
	}
	sheet.getRange(3, 3 + 4*mm).setFormula(s);

	SpreadsheetApp.flush();
	console.timeEnd('add-on/setup/part10');
}


function setupPart9_() {
	console.time('add-on/setup/part9');
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
	console.timeEnd('add-on/setup/part9');
}


function setupPart7_(yyyy_mm) {
	console.time('add-on/setup/part7');
	var sheetSummary = CONST_LIST_ES_SHEETS_["summary"];
	var sheet, md, i;
	var formulas;
	var h_, w_;

	h_ = TABLE_DIMENSION_.height;
	w_ = TABLE_DIMENSION_.width;

	sheetSummary.setTabColor('#e69138');
	CONST_LIST_ES_SHEETS_["cards"].setTabColor('#e69138');
	CONST_LIST_ES_SHEETS_["cash_flow"].setTabColor('#e69138');
	CONST_LIST_ES_SHEETS_["tags"].setTabColor('#e69138');
	CONST_LIST_ES_SHEETS_["quick_actions"].setTabColor('#6aa84f');
	CONST_LIST_ES_SHEETS_["_backstage"].setTabColor('#cc0000').hideSheet();
	CONST_LIST_ES_SHEETS_["_settings"].setTabColor('#cc0000').hideSheet();
	CONST_LIST_ES_SHEETS_["about"].setTabColor('#6aa84f').hideSheet();

	sheetSummary.getRange('B2').setValue(CONST_SETUP_SETTINGS_["financial_year"] + ' | Year Summary');

	formulas = [ ];

	for (i = 0; i < 12; i++) {

		formulas[i] = [
			"='_Backstage'!$B" + (3 + h_*i), null,
			"=SUM('_Backstage'!$B" + (4 + h_*i) + ":$B" + (6 + h_*i) + ")", null
		];
	}

	sheetSummary.getRange(11, 4, 12, 4).setFormulas(formulas);

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
	console.timeEnd('add-on/setup/part7');
}


function setupPart6_() {
	console.time('add-on/setup/part6');
	var sheetCards = CONST_LIST_ES_SHEETS_["cards"];
	var sheet, formula;
	var header, c;
	var i, k;
	var h_, w_;

	h_ = TABLE_DIMENSION_.height;
	w_ = TABLE_DIMENSION_.width;

	CONST_SETUP_SPREADSHEET_.setActiveSheet(sheetCards);
	CONST_SETUP_SPREADSHEET_.moveActiveSheet(15);

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
	console.timeEnd('add-on/setup/part6');
}


function setupPart5_() {
	console.time('add-on/setup/part5');
	var formulaSumIncome, formulaSumExpenses;
	var i, k;
	var h_, w_;

	h_ = TABLE_DIMENSION_.height;
	w_ = TABLE_DIMENSION_.width;

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
	console.timeEnd('add-on/setup/part5');
}


function setupPart4_() {
	console.time('add-on/setup/part4');
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
	console.timeEnd('add-on/setup/part4');
}


function setupPart3_() {
	console.time('add-on/setup/part3');
	var d, n, w_;

	w_ = TABLE_DIMENSION_.width;
	n = CONST_SETUP_SETTINGS_["number_accounts"];
	d = 5 - n;

	if (n !== 5) {
		CONST_LIST_ES_SHEETS_["_backstage"].deleteColumns(7 + w_*n, w_*d);

		for (var i = 0; i < 12; i++) {
			CONST_LIST_MN_SHEETS_[i].deleteColumns(6 + 5*n, 5*d);
		}
	}

	SpreadsheetApp.flush();
	console.timeEnd('add-on/setup/part3');
}


function setupPart2_() {
	console.time('add-on/setup/part2');
	var list_acc = CONST_SETUP_SETTINGS_["list_acc"];
	if (CONST_SETUP_SETTINGS_["number_accounts"] !== list_acc.length) throw "Number number_accounts and list_acc length are differ.";

	var sheet = CONST_LIST_MN_SHEETS_[0];
	var ids, acc, r, i, k, w_;

	w_ = TABLE_DIMENSION_.width;

	r = randomString(7, "lonum");

	db_tables = {
		wallet: r,
		accounts: {
			ids: [ ],
			names: [ ],
			data: [ ]
		},
		cards: {
			count: 0,
			ids: [ ],
			codes: [ ],
			data: [ ]
		}
	};

	ids = [ r ];

	for (k = 0; k < CONST_SETUP_SETTINGS_["number_accounts"]; k++) {
		i = 0;
		do {
			r = "" + randomString(7, "lonum");
			i++;
		} while (ids.indexOf(r) != -1 && i < 99);
		if (i >= 99) throw "Could not generate unique ID for account.";

		ids.push(r);
		db_tables.accounts.ids.push(r);

		acc = {
			id: r,
			name: list_acc[k],
			balance: 0,
			time_a: CONST_SETUP_SETTINGS_["init_month"],
			time_z: 11
		};

		CONST_LIST_ES_SHEETS_["_backstage"].getRange(1, 7 + w_*k).setValue(list_acc[k]);
		sheet.getRange(1, 6 + k*5).setValue(list_acc[k]);

		db_tables.accounts.names.push(list_acc[k]);
		db_tables.accounts.data.push(acc);
	}

	setPropertiesService_('document', 'json', 'DB_TABLES', db_tables);
	console.timeEnd('add-on/setup/part2');
}


function setupPart1_(yyyy_mm) {
	console.time('add-on/setup/part1');
	var cell, d;

	CONST_SETUP_SPREADSHEET_.setActiveSheet(CONST_LIST_ES_SHEETS_["_settings"]);
	CONST_SETUP_SPREADSHEET_.moveActiveSheet(19);

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
		initial_month: CONST_SETUP_SETTINGS_["init_month"],
		financial_calendar: "",
		PostDayEvents: false,
		CashFlowEvents: false,
		OverrideZero: false,
		spreadsheet_locale: CONST_SETUP_SETTINGS_["spreadsheet_locale"]
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
		d = new Date(CONST_SETUP_SETTINGS_["financial_year"], 0, 2);
		d = d.getDay();
		createScriptAppTriggers_('document', 'weeklyMainId', 'onWeekDay', 'weekly_Bar_', d);
		setPropertiesService_('document', 'string', 'OperationMode', "passive");
	}

	SpreadsheetApp.flush();
	console.timeEnd('add-on/setup/part1');
}
