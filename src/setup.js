function askDeactivation() {
	var Ui = SpreadsheetApp.getUi(); // Same variations.
	var s = randomString(5, "upnum");

	var result = Ui.prompt(
			"Deactivate add-on",
			"This action cannot be undone!\nPlease type in the code " + s + " to confirm:",
			Ui.ButtonSet.OK_CANCEL);

	var button = result.getSelectedButton();
	var text = result.getResponseText();
	if (button == Ui.Button.OK && text === s) {
		uninstallAndLock_();
		onOpen();
		console.info("add-on/deactivate");
		return true;
	}
}


function askResetProtection() {
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

	number_accounts = getConstProperties_("number_accounts");

	for (i = 0; i < 12; i++) {
		sheet = spreadsheet.getSheetByName(MN_SHORT[i]);
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

	var financial_year = getConstProperties_("financial_year");
	var date = getSpreadsheetDate();
	var d;

	purgeScriptAppTriggers_();

	createScriptAppTriggers_("document", "onEditMainId", "onEdit", "onEdit_Main_");
	createScriptAppTriggers_("document", "onOpenTriggerId", "onOpen", "onOpenInstallable_");

	if (financial_year < date.getFullYear()) {
		setSpreadsheetSettings_("operation_mode", "passive");
		createScriptAppTriggers_("document", "weeklyMainId", "onWeekDay", "weekly_Foo_", 2);

	} else if (financial_year === date.getFullYear()) {
		setSpreadsheetSettings_("operation_mode", "active");
		createScriptAppTriggers_("document", "dailyMainId", "everyDays", "daily_Main_", 1, 2);

	} else if (financial_year > date.getFullYear()) {
		d = new Date(financial_year, 0, 2);
		d = d.getDay();
		setSpreadsheetSettings_("operation_mode", "passive");
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


function uninstallAndLock_() {
	var list = ScriptApp.getUserTriggers( SpreadsheetApp.getActiveSpreadsheet() );

	for (var i = 0; i < list.length; i++) {
		ScriptApp.deleteTrigger(list[i]);
	}

	PropertiesService.getDocumentProperties().setProperties({lock_spreadsheet: "true"}, true);
	console.info("add-on/uninstall-with-lock");
}


function setup_ui(settings, list_acc) {
	if (getPropertiesService_("document", "", "is_installed")) {
		showDialogSetupEnd();
		onOpen();
		return 1;
	}

	var lock = LockService.getDocumentLock();
	try {
		lock.waitLock(200);
	} catch (err) {
		SpreadsheetApp.getUi().alert(
			"Add-on is busy",
			"A budget spreadsheet setup is in progress.",
			SpreadsheetApp.getUi().ButtonSet.OK);

		consoleLog_("warn", "setup_ui(): Wait lock time out.", err);
		return 1;
	}

	if (!settings && !list_acc) return;

	setup_(settings, list_acc);

	setPropertiesService_("document", "boolean", "is_installed", true);
	showDialogSetupEnd();
	onOpen();
}


function setup_(settings, list_acc) {
	var class_version2, yyyy_mm;

	SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
	SETUP_SETTINGS = {
		spreadsheet_name: settings.spreadsheet_name,
		financial_year: Number(settings.financial_year),
		init_month: Number(settings.initial_month),
		number_accounts: Number(settings.number_accounts),
		list_acc: list_acc,
		decimal_separator: true
	};

	console.time("add-on/install");

	SPREADSHEET.rename(SETUP_SETTINGS["spreadsheet_name"]);

	purgePropertiesService_("document");
	purgeScriptAppTriggers_();
	CacheService.getDocumentCache().removeAll([
		"class_version2", "user_settings", "spreadsheet_settings", "const_properties"
	]);

	deleteAllSheets_();
	copySheetsFromTemplate_();

	yyyy_mm = {
		time: DATE_NOW.getTime(),
		yyyy: DATE_NOW.getFullYear(),
		mm: DATE_NOW.getMonth()
	};

	setupSettings_(yyyy_mm);
	setupProperties_(yyyy_mm);
	setupTables_();
	setupMonthSheet_();
	setupBackstage_();
	setupSummary_();
	setupTags_();
	setupCards_();
	setupCashFlow_();
	setupWest_();
	setupEast_(yyyy_mm);

	class_version2 = {
		script: APPS_SCRIPT_GLOBAL.script_version,
		template: APPS_SCRIPT_GLOBAL.template_version
	};
	class_version2.script.beta = PATCH_THIS["beta_list"].length;
	setPropertiesService_("document", "json", "class_version2", class_version2);

	if (nodeControl_("sign")) {
		throw new Error("Failed to sign document.");
	}

	SPREADSHEET.setActiveSheet(SPREADSHEET.getSheetByName("Summary"));
	console.timeEnd("add-on/install");

	SPREADSHEET = null;
	SETUP_SETTINGS = null;
}


function setupEast_(yyyy_mm) {
	console.time("add-on/setup/east");
	var spreadsheet = SPREADSHEET;
	var sheets, sheet;
	var md, t, i;

	const init_month = SETUP_SETTINGS["init_month"];

	if (yyyy_mm.yyyy == SETUP_SETTINGS["financial_year"]) {
		t = true;
		md = getMonthDelta(yyyy_mm.mm);
	} else {
		t = false;
	}

	sheets = [ ];
	for (i = 0; i < 12; i++) {
		sheets[i] = spreadsheet.getSheetByName(MN_SHORT[i]);
	}

	sheet = spreadsheet.getSheetByName("Summary");
	spreadsheet.setActiveSheet(sheet);
	sheet.setTabColor("#e69138");

	for (i = 0; i < 12; i++) {
		sheet = sheets[i];

		if (i < init_month) {
			if (t && (i < yyyy_mm.mm + md[0] || i > yyyy_mm.mm + md[1])) {
				sheet.setTabColor("#b7b7b7");
			} else {
				sheet.setTabColor("#b7b7b7");
			}
		} else if (t) {
			if (i < yyyy_mm.mm + md[0] || i > yyyy_mm.mm + md[1]) {
				sheet.setTabColor("#a4c2f4");
			} else {
				sheet.setTabColor("#3c78d8");
			}
		} else {
			sheet.setTabColor("#a4c2f4");
		}
	}

	if (t) {
		sheets[yyyy_mm.mm].setTabColor("#6aa84f");
	}

	spreadsheet.getSheetByName("Cards").setTabColor("#e69138");
	spreadsheet.getSheetByName("Cash Flow").setTabColor("#e69138");
	spreadsheet.getSheetByName("Tags").setTabColor("#e69138");
	spreadsheet.getSheetByName("_Backstage").setTabColor("#cc0000");
	spreadsheet.getSheetByName("_Settings").setTabColor("#cc0000");
	spreadsheet.getSheetByName("Quick Actions").setTabColor("#6aa84f");
	spreadsheet.getSheetByName("_About BnS").setTabColor("#6aa84f");

	if (t) {
		for (i = 0; i < 12; i++) {
			sheet = sheets[i];

			if (i < init_month && (i < yyyy_mm.mm + md[0] || i > yyyy_mm.mm + md[1])) {
				sheet.hideSheet();
			} else if (i < yyyy_mm.mm + md[0] || i > yyyy_mm.mm + md[1]) {
				sheet.hideSheet();
			}
		}

		if (yyyy_mm.mm == 11) {
			sheets[8].showSheet();
		}
	}

	spreadsheet.getSheetByName("_Backstage").hideSheet();
	spreadsheet.getSheetByName("_Settings").hideSheet();
	spreadsheet.getSheetByName("_About BnS").hideSheet();

	SpreadsheetApp.flush();
	console.timeEnd("add-on/setup/east");
}


function setupWest_() {
	console.time("add-on/setup/west");
	var sheet, ranges;

	SPREADSHEET.getSheetByName("_About BnS")
		.protect()
		.setWarningOnly(true);


	sheet = SPREADSHEET.getSheetByName("Quick Actions");

	ranges = [ ];
	ranges[0] = sheet.getRange(4, 2, 3, 1);
	ranges[1] = sheet.getRange(9, 2, 2, 1);
	ranges[2] = sheet.getRange(13, 1, 1, 2);

	sheet.protect()
		.setUnprotectedRanges(ranges)
		.setWarningOnly(true);

	SpreadsheetApp.flush();
	console.timeEnd("add-on/setup/west");
}


function setupCashFlow_() {
	console.time("add-on/setup/cash-flow");
	var sheet = SPREADSHEET.getSheetByName("Cash Flow");
	var ranges, formula, b_f3f3f3, b_d9ead3;
	var d, s;
	var i, j, k;

	const h_ = TABLE_DIMENSION.height;

	const init_month = SETUP_SETTINGS["init_month"];
	const dec_p = SETUP_SETTINGS["decimal_separator"];
	const num_acc = SETUP_SETTINGS["number_accounts"];
	const financial_year = SETUP_SETTINGS["financial_year"];

	const dec_c = (dec_p ? "," : "\\");
	const options = "{\"charttype\"" + dec_c + "\"column\"; \"color\"" + dec_c + "\"#93c47d\"; \"negcolor\"" + dec_c + "\"#e06666\"; \"empty\"" + dec_c + "\"zero\"; \"nan\"" + dec_c + "\"convert\"}";

	ranges = [ ];
	for (i = 0; i < 12; i++) {
		ranges[2*i] = sheet.getRange(4, 2 + 4*i, 31);
		ranges[2*i + 1] = sheet.getRange(4, 4 + 4*i, 31);
	}

	sheet.protect()
		.setUnprotectedRanges(ranges)
		.setWarningOnly(true);

	// if (financial_year == 2020) {
	// 	ranges = [ "C4:C33", "G4:G31", "K4:K33", "O4:O32", "S4:S33", "W4:W32", "AA4:AA33", "AE4:AE33", "AI4:AI32", "AM4:AM33", "AQ4:AQ32", "AU4:AU33" ];
	//
	// 	b_f3f3f3 = [ "F32:H33", "N33:P33", "V33:X33", "AH33:AJ33", "AP33:AR33" ];
	//
	// 	b_d9ead3 = [ "B6:D6", "B7:D7", "B13:D13", "B14:D14", "B20:D20", "B21:D21", "B27:D27", "B28:D28", "F3:H3", "F4:H4", "F10:H10", "F11:H11", "F17:H17", "F18:H18", "F24:H24", "F25:H25", "F31:H31", "J3:L3", "J9:L9", "J10:L10", "J16:L16", "J17:L17", "J23:L23", "J24:L24", "J30:L30", "J31:L31", "N6:P6", "N7:P7", "N13:P13", "N14:P14", "N20:P20", "N21:P21", "N27:P27", "N28:P28", "R4:T4", "R5:T5", "R11:T11", "R12:T12", "R18:T18", "R19:T19", "R25:T25", "R26:T26", "R32:T32", "R33:T33", "V8:X8", "V9:X9", "V15:X15", "V16:X16", "V22:X22", "V23:X23", "V29:X29", "V30:X30", "Z6:AB6", "Z7:AB7", "Z13:AB13", "Z14:AB14", "Z20:AB20", "Z21:AB21", "Z27:AB27", "Z28:AB28", "AD3:AF3", "AD4:AF4", "AD10:AF10", "AD11:AF11", "AD17:AF17", "AD18:AF18", "AD24:AF24", "AD25:AF25", "AD31:AF31", "AD32:AF32", "AH7:AJ7", "AH8:AJ8", "AH14:AJ14", "AH15:AJ15", "AH21:AJ21", "AH22:AJ22", "AH28:AJ28", "AH29:AJ29", "AL5:AN5", "AL6:AN6", "AL12:AN12", "AL13:AN13", "AL19:AN19", "AL20:AN20", "AL26:AN26", "AL27:AN27", "AL33:AN33", "AP3:AR3", "AP9:AR9", "AP10:AR10", "AP16:AR16", "AP17:AR17", "AP23:AR23", "AP24:AR24", "AP30:AR30", "AP31:AR31", "AT7:AV7", "AT8:AV8", "AT14:AV14", "AT15:AV15", "AT21:AV21", "AT22:AV22", "AT28:AV28", "AT29:AV29" ];
	//
	// 	for (i = 1; i < 12; i++) {
	// 		d = new Date(financial_year, i, 0).getDate();
	// 		sheet.getRange(4, 3 + 4*i).setFormulaR1C1("=R[" + (d - 1) + "]C[-4] + RC[-1]");
	// 	}
	// } else {
		ranges = [ ];
		b_f3f3f3 = [ ];
		b_d9ead3 = [ ];

		i = 0;
		d = new Date(financial_year, 1 + i, 0).getDate();
		ranges.push([ rollA1Notation(5, 3 + 4*i, d - 1) ]);
		if (d < 31) {
			b_f3f3f3.push([ rollA1Notation(4 + d, 2 + 4*i, 31 - d, 3) ]);
		}

		formula = "SPARKLINE(" + rollA1Notation(4, 3 + 4*i, d, 1) + "; " + options + ")";
		sheet.getRange(2, 2 + 4*i).setFormula(formula);

		j = 0;
		s = new Date(financial_year, 0, 1).getDay();
		while (j < d) {
			switch (s) {
				case 0:
					b_d9ead3.push([ rollA1Notation(4 + j, 2, 1, 3) ]);
					s += 6;
					j += 6;
					break;
				case 6:
					b_d9ead3.push([ rollA1Notation(4 + j, 2, 1, 3) ]);
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
			sheet.getRange(4, 3 + 4*i).setFormulaR1C1("=R[" + (d - 1) + "]C[-4] + RC[-1]");

			d = new Date(financial_year, 1 + i, 0).getDate();
			ranges.push([ rollA1Notation(5, 3 + 4*i, d - 1) ]);
			if (d < 31) {
				b_f3f3f3.push([ rollA1Notation(4 + d, 2 + 4*i, 31 - d, 3) ]);
			}

			formula = "SPARKLINE(" + rollA1Notation(4, 3 + 4*i, d, 1) + "; " + options + ")";
			sheet.getRange(2, 2 + 4*i).setFormula(formula);

			j = 0;
			s = new Date(financial_year, i, 1).getDay();
			while (j < d) {
				switch (s) {
					case 0:
						b_d9ead3.push([ rollA1Notation(4 + j, 2 + 4*i, 1, 3) ]);
						s = 6;
						j += 6;
						break;
					case 6:
						b_d9ead3.push([ rollA1Notation(4 + j, 2 + 4*i, 1, 3) ]);
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
	// }

	sheet.getRangeList(ranges).setFormulaR1C1("=R[-1]C + RC[-1]");
	sheet.getRangeList(b_f3f3f3).setBackground("#f3f3f3");
	sheet.getRangeList(b_d9ead3).setBackground("#d9ead3");

	ranges = [ "G", "L", "Q", "V", "AA" ];

	sheet.getRange(4, 3).setFormula("=0 + B4");

	if (init_month == 0) {
		formula = "=0 + B4";
	} else {
		d = new Date(financial_year, init_month, 0).getDate();
		formula = "=" + rollA1Notation(3 + d, 4*init_month - 1) + " + " + rollA1Notation(4, 2 + 4*init_month);
	}

	for (k = 0; k < num_acc; k++) {
		 formula += " + \'_Backstage\'!" + ranges[k] + (2 + h_*init_month);
	}
	sheet.getRange(4, 3 + 4*init_month).setFormula(formula);

	SpreadsheetApp.flush();
	console.timeEnd("add-on/setup/cash-flow");
}


function setupSummary_() {
	console.time("add-on/setup/summary");
	var sheet = SPREADSHEET.getSheetByName("Summary");
	var chart, options;

	const h_ = TABLE_DIMENSION.height;

	options = {
		0: {color: "#b7b7b7", type: "bars", labelInLegend: "Income"},
		1: {color: "#cccccc", type: "bars", labelInLegend: "Expenses"},
		2: {color: "#45818e", type: "bars", labelInLegend: "Income"},
		3: {color: "#e69138", type: "bars", labelInLegend: "Expenses"}
	};

	sheet.protect().setWarningOnly(true);
	sheet.getRange("B2").setValue(SETUP_SETTINGS["financial_year"] + " | Year Summary");

	formulas = [ ];
	for (i = 0; i < 12; i++) {
		formulas[i] = [ "", null, "", null ];

		formulas[i][0] = "=\'_Backstage\'!$B" + (3 + h_*i);
		formulas[i][2] = "=SUM(\'_Backstage\'!$B" + (4 + h_*i) + ":$B" + (6 + h_*i) + ")";
	}
	sheet.getRange(11, 4, 12, 4).setFormulas(formulas);

	chart = sheet.newChart()
		.addRange( sheet.getRange("C25:H36") )
		.setChartType(Charts.ChartType.COMBO)
		.setPosition(24, 2, 0, 0)
		.setOption("mode", "view")
		.setOption("legend", "top")
		.setOption("focusTarget", "category")
		.setOption("series", options)
		.setOption("height", 482)
		.setOption("width", 886);

	sheet.insertChart( chart.build() );

	SpreadsheetApp.flush();
	console.timeEnd("add-on/setup/summary");
}


function setupCards_() {
	console.time("add-on/setup/cards");
	var sheet = SPREADSHEET.getSheetByName("Cards");
	var ranges, formula, head, cell;
	var expr1, expr2, expr3;
	var i, k;

	const h_ = TABLE_DIMENSION.height;
	const w_ = TABLE_DIMENSION.width;

	const dec_p = SETUP_SETTINGS["decimal_separator"];
	const num_acc = SETUP_SETTINGS["number_accounts"];

	const col = 2 + w_ + w_*num_acc;
	const dec_c = (dec_p ? "," : "\\");
	const header = rollA1Notation(1, col, 1, w_*11);

	SPREADSHEET.setActiveSheet(sheet);
	SPREADSHEET.moveActiveSheet(14);

	ranges = [ ];
	for (i = 0; i < 12; i++) {
		ranges[2*i] = sheet.getRange(6, 1 + 6*i, 400, 5);
		ranges[2*i + 1] = sheet.getRange(2, 2 + 6*i, 1, 2);
	}

	sheet.protect()
		.setUnprotectedRanges(ranges)
		.setWarningOnly(true);

	for (i = 0; i < 12; i++) {
		head = rollA1Notation(2, 1 + 6*i);
		cell = "\'_Backstage\'!" + rollA1Notation(2 + h_*i, col);

		sheet.getRange(2, 2 + 6*i).setValue("All");

		formula = "OFFSET(" + cell + "; 4; 1 + 5*" + head + "; 1; 1)";
		formula = "TEXT(" + formula + "; \"#,##0.00;(#,##0.00)\")";
		formula = "IF(" + rollA1Notation(2, 2 + 6*i) + " = \"All\"; \"\"; " + formula + ")";
		formula = "CONCATENATE(\"AVAIL credit: \"; " + formula + ")";
		sheet.getRange(3, 1 + 6*i).setFormula(formula);


		expr1 = "MAX(0; OFFSET(" + cell + "; 4; 1 + 5*" + head + "; 1; 1))";
		expr2 = "OFFSET(" + cell + "; 1; 1 + 5*" + head + "; 1; 1)";
		expr3 = "{\"charttype\"" + dec_c + "\"bar\"; \"max\"" + dec_c + "OFFSET(" + cell + "; 0; 1 + 5*" + head + "; 1; 1); \"color1\"" + dec_c + "\"#45818e\"; \"color2\"" + dec_c + "\"#e69138\"}";

		formula = "{" + expr1 + dec_c + expr2 + "}; " + expr3;
		formula = "IF(" + rollA1Notation(2, 2 + 6*i) + " = \"All\"; \"\"; SPARKLINE(" + formula + "))";
		sheet.getRange(4, 1 + 6*i).setFormula(formula);

		formula = "REGEXMATCH(\'_Backstage\'!" + header + "; \"\\^\"&" + rollA1Notation(2, 2 + 6*i) + "&\"\\$\")";
		formula = "FILTER(\'_Backstage\'!" + header + "; " + formula + ")";
		formula = "INDEX(" + formula + "; 0; 1)";
		formula = "IF(" + rollA1Notation(2, 2 + 6*i) + " = \"All\"; 1; MATCH(" + formula + "; \'_Backstage\'!" + header + "; 0))";
		formula = "IFERROR((" + formula + " - 1)/5; \"\")";
		sheet.getRange(2, 1 + 6*i).setFormula(formula);


		expr1 = "OFFSET(" + cell + "; 1; 5*" + head + "; 1; 1)";
		expr1 = "\"Credit: \"; TEXT(" + expr1 + "; \"#,##0.00;(#,##0.00)\"); \"\n\"; ";

		expr2 = "OFFSET(" + cell + "; 3; 5*" + head + "; 1; 1)";
		expr2 = "\"Expenses: \"; TEXT(" + expr2 + "; \"#,##0.00;(#,##0.00)\"); \"\n\"; ";

		expr3 = "OFFSET(" + cell + "; 4; 5*" + head + "; 1; 1)";
		expr3 = "\"Balance: \"; TEXT(" + expr3 + "; \"#,##0.00;(#,##0.00)\")";

		formula = "CONCATENATE(" + expr1 + expr2 + "\"\n\"; " + expr3 + ")";
		sheet.getRange(2, 4 + 6*i).setFormula(formula);
	}

	SpreadsheetApp.flush();
	console.timeEnd("add-on/setup/cards");
}


function setupTags_() {
	console.time("add-on/setup/tags");
	var sheet = SPREADSHEET.getSheetByName("Tags");
	var ranges, formula, formulas, rg, cd;
	var tags, combo;
	var i, k;

	const num_acc = SETUP_SETTINGS["number_accounts"];

	formulas = [[ ]];

	tags = [ ];
	combo = [ ];
	for (k = 0; k < 1 + num_acc; k++) {
		tags[k] = rollA1Notation(5, 4 + 5*k, -1, 1);
		combo[k] = rollA1Notation(5, 3 + 5*k, -1, 2);
	}

	ranges = sheet.getRange(2, 1, 90, 5);
	sheet.protect()
		.setUnprotectedRanges([ ranges ])
		.setWarningOnly(true);

	for (i = 0; i < 12; i++) {
		rg = "{\'" + MN_SHORT[i] + "\'!" + combo[0];
		cd = "{\'" + MN_SHORT[i] + "\'!" + tags[0];

		for (k = 1; k < 1 + num_acc; k++) {
			rg += "; \'" + MN_SHORT[i] + "\'!" + combo[k];
			cd += "; \'" + MN_SHORT[i] + "\'!" + tags[k];
		}

		rg += "; \'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1, 2) + "}";
		cd += "; \'Cards\'!" + rollA1Notation(6, 5 + 6*i, -1, 1) + "}";

		formula = "IFERROR(FILTER(" + rg + "; NOT(ISBLANK(" + cd + "))); \"\")";
		formula = "BSSUMBYTAG(TRANSPOSE($E$1:$E); " + formula + ")";
		formula = "{\"" + MN_FULL[i] + "\"; IF(\'_Settings\'!$B$7 > 0; " + formula + "; )}";

		formulas[0][i] = formula;
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
	console.timeEnd("add-on/setup/tags");
}


function setupTables_() {
	console.time("add-on/setup/tables");
	var ids, acc, r, i, k;

	const w_ = TABLE_DIMENSION.width;

	const list_acc = SETUP_SETTINGS["list_acc"];
	const num_acc = SETUP_SETTINGS["number_accounts"];

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

	for (k = 0; k < num_acc; k++) {
		i = 0;
		do {
			r = "" + randomString(7, "lonum");
			i++;
		} while (ids.indexOf(r) != -1 && i < 99);
		if (i >= 99) throw new Error("Could not generate unique ID for account.");

		ids.push(r);
		db_tables.accounts.ids.push(r);

		acc = {
			id: r,
			name: list_acc[k],
			balance: 0,
			time_a: SETUP_SETTINGS["init_month"],
			time_z: 11
		};

		db_tables.accounts.names.push(list_acc[k]);
		db_tables.accounts.data.push(acc);
	}

	setPropertiesService_("document", "json", "DB_TABLES", db_tables);
	console.timeEnd("add-on/setup/tables");
}


function setupProperties_(yyyy_mm) {
	console.time("add-on/setup/properties");
	var properties, d;
	var user, owner, operation;

	properties = {
		initial_month: SETUP_SETTINGS["init_month"],
		financial_calendar: "",
		post_day_events: false,
		cash_flow_events: false,
		override_zero: false
	};
	setPropertiesService_("document", "json", "user_settings", properties);

	user = getPropertiesService_("user", "string", "user_id");

	try {
		owner = SPREADSHEET.getOwner().getEmail();
	} catch (err) {
		console.warn(err);
		owner = "";
	}

	if (owner) {
		owner = computeDigest("SHA_256", owner, "UTF_8");
	} else {
		owner = "";
	}

	properties = {
		addon_user: user,
		spreadsheet_owner: owner,
		spreadsheet_id: SPREADSHEET.getId(),
		date_created: yyyy_mm.time,
		number_accounts: SETUP_SETTINGS["number_accounts"],
		financial_year: SETUP_SETTINGS["financial_year"]
	};
	setPropertiesService_("document", "obj", "const_properties", properties);

	createScriptAppTriggers_("document", "onEditMainId", "onEdit", "onEdit_Main_");
	createScriptAppTriggers_("document", "onOpenTriggerId", "onOpen", "onOpenInstallable_");
	if (SETUP_SETTINGS["financial_year"] < yyyy_mm.yyyy) {
		createScriptAppTriggers_("document", "weeklyMainId", "onWeekDay", "weekly_Foo_", 2);
		operation = "passive";

	} else if (SETUP_SETTINGS["financial_year"] == yyyy_mm.yyyy) {
		createScriptAppTriggers_("document", "dailyMainId", "everyDays", "daily_Main_", 1, 2);
		operation = "active";

	} else if (SETUP_SETTINGS["financial_year"] > yyyy_mm.yyyy) {
		d = new Date(SETUP_SETTINGS["financial_year"], 0, 2);
		d = d.getDay();
		createScriptAppTriggers_("document", "weeklyMainId", "onWeekDay", "weekly_Bar_", d);
		operation = "passive";
	}

	properties = {
		operation_mode: operation,
		decimal_separator: SETUP_SETTINGS["decimal_separator"],
		spreadsheet_locale: SPREADSHEET.getSpreadsheetLocale()
	};
	setPropertiesService_("document", "json", "spreadsheet_settings", properties);

	console.timeEnd("add-on/setup/properties");
}


function setupSettings_(yyyy_mm) {
	console.time("add-on/setup/settings");
	var sheet = SPREADSHEET.getSheetByName("_Settings");
	var cell, dec_p;

	SPREADSHEET.setActiveSheet(sheet);
	SPREADSHEET.moveActiveSheet(7);

	sheet.protect().setWarningOnly(true);

	cell = sheet.getRange(8, 2);
	cell.setNumberFormat("0.0");
	cell.setValue(0.1);
	SpreadsheetApp.flush();

	cell = cell.getDisplayValue();
	dec_p = /\./.test(cell);

	SETUP_SETTINGS["decimal_separator"] = dec_p;

	cell = [
		[ "=" + SETUP_SETTINGS["financial_year"].formatLocaleSignal(dec_p) ],
		[ "=IF(YEAR(TODAY()) = $B2; MONTH(TODAY()); IF(YEAR(TODAY()) < $B2; 0; 12))" ],
		[ "=" + (SETUP_SETTINGS["init_month"] + 1).formatLocaleSignal(dec_p) ],
		[ "=IF($B4 > $B3; 0; $B3 - $B4 + 1)" ],
		[ "=IF(AND($B3 = 12; YEAR(TODAY()) <> $B2); $B5; MAX($B5 - 1; 0))" ],
		[ "=COUNTIF(\'Tags\'!$E1:$E; \"<>\") - 1" ],
		[ "=RAND()" ]
	];
	sheet.getRange(2, 2, 7, 1).setFormulas(cell);

	SpreadsheetApp.flush();
	console.timeEnd("add-on/setup/settings");
}


function setupBackstage_() {
	console.time("add-on/setup/backstage");
	var sheet = SPREADSHEET.getSheetByName("_Backstage");
	var formulas, formula;
	var income, expenses;
	var n, i, k;

	const h_ = TABLE_DIMENSION.height;
	const w_ = TABLE_DIMENSION.width;

	const list_acc = SETUP_SETTINGS["list_acc"];
	const num_acc = SETUP_SETTINGS["number_accounts"];
	const dec_p = SETUP_SETTINGS["decimal_separator"];

	const values = [ "C5:C404", "H5:H404", "M5:M404", "R5:R404", "W5:W404", "AB5:AB404" ];
	const tags = [ "D5:D404", "I5:I404", "N5:N404", "S5:S404", "X5:X404", "AC5:AC404" ];
	const combo = [ "C5:D404", "H5:I404", "M5:N404", "R5:S404", "W5:X404", "AB5:AC404" ];
	const balance1 = [ "G2", "L2", "Q2", "V2", "AA2", "G12", "L12", "Q12", "V12", "AA12", "G22", "L22", "Q22", "V22", "AA22", "G32", "L32", "Q32", "V32", "AA32", "G42", "L42", "Q42", "V42", "AA42", "G52", "L52", "Q52", "V52", "AA52", "G62", "L62", "Q62", "V62", "AA62", "G72", "L72", "Q72", "V72", "AA72", "G82", "L82", "Q82", "V82", "AA82", "G92", "L92", "Q92", "V92", "AA92", "G102", "L102", "Q102", "V102", "AA102", "G112", "L112", "Q112", "V112", "AA112" ];
	const balance2 = [ "0", "0", "0", "0", "0", "G3", "L3", "Q3", "V3", "AA3", "G13", "L13", "Q13", "V13", "AA13", "G23", "L23", "Q23", "V23", "AA23", "G33", "L33", "Q33", "V33", "AA33", "G43", "L43", "Q43", "V43", "AA43", "G53", "L53", "Q53", "V53", "AA53", "G63", "L63", "Q63", "V63", "AA63", "G73", "L73", "Q73", "V73", "AA73", "G83", "L83", "Q83", "V83", "AA83", "G93", "L93", "Q93", "V93", "AA93", "G103", "L103", "Q103", "V103", "AA103" ];

	const col = 2 + w_ + w_*num_acc + w_;
	const dec_c = (dec_p ? "," : "\\");

	n = w_*num_acc;
	formulas = new Array(120);

	for (i = 0; i < 120; i++) {
		formulas[i] = new Array(n);

		for (k = 0; k < n; k++) {
			formulas[i][k] = null;
		}
	}

	sheet.protect().setWarningOnly(true);

	if (num_acc < 5) {
		sheet.deleteColumns(7 + w_*num_acc, w_*(5 - num_acc));
	}
	SpreadsheetApp.flush();

	for (k = 0; k < num_acc; k++) {
		sheet.getRange(1, 7 + w_*k).setValue(list_acc[k]);
	}

	for (i = 0; i < 12; i++) {
		k = 0;

		income = "";
		expenses = "";

		formula = "IFERROR(SUM(\'" + MN_SHORT[i] + "\'!" + values[k] + "); 0)";
		sheet.getRange(4 + h_*i, 2).setFormula(formula);

		for (; k < num_acc; k++) {
			income += " + " + rollA1Notation(6 + h_*i, 8 + w_*k);
			expenses += " + " + rollA1Notation(4 + h_*i, 7 + w_*k);


			formulas[h_*i][w_*k] = "=" + balance2[5*i + k];

			formula = "NOT(ISBLANK(\'" + MN_SHORT[i] + "\'!" + values[1 + k] + "))";
			formula = "FILTER(\'" + MN_SHORT[i] + "\'!" + values[1 + k] + "; " + formula + ")";
			formula = balance1[5*i + k] + " + IFERROR(SUM(" + formula + "); 0)";
			formulas[1 + h_*i][w_*k] = formula;

			formula = "NOT(REGEXMATCH(\'" + MN_SHORT[i] + "\'!" + tags[1 + k] + "; \"#(dp|wd|qcc|ign|rct|trf)\"))";
			formula = "NOT(ISBLANK(\'" + MN_SHORT[i] + "\'!" + values[1 + k] + ")); " + formula;
			formula = "FILTER(\'" + MN_SHORT[i] + "\'!" + values[1 + k] + "; " + formula + ")";
			formula = "IFERROR(SUM(" + formula + "); 0)";
			formulas[2 + h_*i][w_*k] = formula;

			formula = "NOT(ISBLANK(\'" + MN_SHORT[i] + "\'!" + tags[1 + k] + "))";
			formula = "IFERROR(FILTER(\'" + MN_SHORT[i] + "\'!" + combo[1 + k] + "; " + formula + "); \"\")";
			formula = "BSREPORT(TRANSPOSE(" + formula + "))";
			formulas[h_*i][1 + w_*k] = formula;
		}

		for (k = 0; k < 10; k++) {
			formula = "REGEXEXTRACT(\'Cards\'!" + rollA1Notation(6, 2 + 6*i, -1) + "; \"[0-9]+/[0-9]+\")";
			formula = "ARRAYFORMULA(SPLIT(" + formula + "; \"/\"))";
			formula = "{" + formula + dec_c + " \'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + "}; ";
			formula = formula + "REGEXMATCH(\'Cards\'!" + rollA1Notation(6, 3 + 6*i, -1) + "; " + rollA1Notation(1, col + w_*k) + "); ";

			formula = formula + "NOT(ISBLANK(\'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + ")); ";
			formula = formula + "REGEXMATCH(\'Cards\'!" + rollA1Notation(6, 2 + 6*i, -1) + "; \"[0-9]+/[0-9]+\")";

			formula = "BSCARDPART(TRANSPOSE(IFNA(FILTER(" + formula + "); 0)))";
			formula = "IF(" + rollA1Notation(1, col + w_*k) + " = \"\"; 0; " + formula + ")";

			sheet.getRange(5 + h_*i, 1 + col + w_*k).setFormula(formula);
		}

		sheet.getRange(3 + h_*i, 2).setFormula(income);
		sheet.getRange(5 + h_*i, 2).setFormula(expenses);
	}
	sheet.getRange(2, 7, 120, w_*num_acc).setFormulas(formulas);

	console.timeEnd("add-on/setup/backstage");
}


function setupMonthSheet_() {
	console.time("add-on/setup/month-sheet");
	var sheetTTT = SPREADSHEET.getSheetByName("TTT");
	var sheets, sheet, ranges, formula;
	var expr1, expr2, expr3, expr4;
	var headers, i, k;

	const h_ = TABLE_DIMENSION.height;
	const w_ = TABLE_DIMENSION.width;

	const list_acc = SETUP_SETTINGS["list_acc"];
	const num_acc = SETUP_SETTINGS["number_accounts"];

	sheets = new Array(12);

	headers = [ ];
	for (k = 0; k < 1 + num_acc; k++) {
		headers[k] = rollA1Notation(1, 1 + 5*k);
	}

	if (num_acc < 5) {
		sheetTTT.deleteColumns(6 + 5*num_acc, 5*(5 - num_acc));
	}
	SpreadsheetApp.flush();

	i = 11;
	while (i > -1) {
		SPREADSHEET.setActiveSheet(sheetTTT);
		sheet = SPREADSHEET.duplicateActiveSheet().setName(MN_SHORT[i]);
		sheets[i] = sheet;

		sheet.getRange("A3").setFormula("CONCAT(\"Expenses \"; TO_TEXT(\'_Backstage\'!$B" + (4+h_*i) + "))");

		ranges = [ ];
		for (k = 0; k < num_acc; k++) {
			ranges[k] = sheet.getRange(5, 1 + 5*k, 400, 4);


			sheet.getRange(2, 6 + 5*k).setFormula("CONCAT(\"Balance \"; TO_TEXT(\'_Backstage\'!" + rollA1Notation(3 + h_*i, 7 + w_*k) + "))");
			sheet.getRange(3, 6 + 5*k).setFormula("CONCAT(\"Expenses \"; TO_TEXT(\'_Backstage\'!" + rollA1Notation(4 + h_*i, 7 + w_*k) + "))");


			expr1 = "TEXT(\'_Backstage\'!" + rollA1Notation(2 + h_*i, 8 + w_*k) + "; \"#,##0.00;-#,##0.00\")";
			expr1 = "\"Withdrawal: (\"; \'_Backstage\'!" + rollA1Notation(2 + h_*i, 9 + w_*k) + "; \") \"; " + expr1 + "; \"\n\"; ";

			expr2 = "TEXT(\'_Backstage\'!" + rollA1Notation(3 + h_*i, 8 + w_*k) + "; \"#,##0.00;-#,##0.00\")";
			expr2 = "\"Deposit: (\"; \'_Backstage\'!" + rollA1Notation(3 + h_*i, 9 + w_*k) + "; \") \"; " + expr2 + "; \"\n\"; ";

			expr3 = "TEXT(\'_Backstage\'!" + rollA1Notation(4 + h_*i, 8 + w_*k) + "; \"#,##0.00;-#,##0.00\")";
			expr3 = "\"Trf. in: (\"; \'_Backstage\'!" + rollA1Notation(4 + h_*i, 9 + w_*k) + "; \") \"; " + expr3 + "; \"\n\"; ";

			expr4 = "TEXT(\'_Backstage\'!" + rollA1Notation(5 + h_*i, 8 + w_*k) + "; \"#,##0.00;-#,##0.00\")";
			expr4 = "\"Trf. out: (\"; \'_Backstage\'!" + rollA1Notation(5 + h_*i, 9 + w_*k) + "; \") \"; " + expr4;

			formula = "CONCATENATE(" + expr1 + expr2 + expr3 + expr4 + ")";
			sheet.getRange(1, 8 + 5*k).setFormula(formula);
		}

		ranges[k] = sheet.getRange(5, 1 + 5*k, 400, 4);
		sheet.protect()
			.setUnprotectedRanges(ranges)
			.setWarningOnly(true);

		i--;
	}

	sheet.getRange(1, 1).setValue("Wallet");
	for (k = 0; k < num_acc; k++) {
		sheet.getRange(1, 6 + k*5).setValue(list_acc[k]);
	}

	for (i = 1; i < 12; i++) {
		for (k = 0; k < 1 + num_acc; k++) {
			sheets[i].getRange(1, 1 + 5*k).setFormula("=\'" + MN_SHORT[i - 1] + "\'!" + headers[k]);
		}
	}

	SPREADSHEET.deleteSheet(sheetTTT);

	console.timeEnd("add-on/setup/month-sheet");
}
