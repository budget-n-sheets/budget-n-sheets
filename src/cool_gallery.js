function coolGallery(option) {
	var lock, s;
	var info;

	info = APPS_SCRIPT_GLOBAL.cool_gallery;
	info = info[option];
	if (!info) {
		ConsoleLog.warn('getCoolSheet_(): Details of page not found.', { option: option, info: info });
		showDialogErrorMessage();
		return 2;
	}

	lock = LockService.getDocumentLock();
	s = lock.tryLock(200);
	if (!s) return 0;
	s = getCoolSheet_(info);
	lock.releaseLock();

	if (s === 0) {
		SpreadsheetApp.getUi().alert(
			"Can't import analytics page",
			"A page with the name \"" + info.sheet_name + "\" already exists. Please rename, or delete the page.",
			SpreadsheetApp.getUi().ButtonSet.OK);
		return -1;
	} else if (s === 1) {
		return 1;
	}

	if (option === "stats_for_tags") {
		coolStatsForTags_(info);
	} else if (option === "filter_by_tag") {
		coolFilterByTag_(info);
	}

	console.info("add-on/cool_gallery/import/" + info.sheet_name);
	return -1;
}

function getCoolSheet_(info) {
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var template;

	if (spreadsheet.getSheetByName(info.sheet_name)) return 0;

	try {
		template = SpreadsheetApp.openById(info.id);
	} catch (err) {
		ConsoleLog.error(err);
		return 1;
	}

	template.getSheetByName(info.sheet_name)
		.copyTo(spreadsheet)
		.setName(info.sheet_name);
	SpreadsheetApp.flush();
}

function coolFilterByTag_(info) {
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var sheet = spreadsheet.getSheetByName(info.sheet_name);
	var sheetTags, formula, range, rule;
	var text, aux1, aux2, aux3;
	var n, i, k;

	const header = "D8";
	const num_acc = getConstProperties_('number_accounts');
	const dec_p = getSpreadsheetSettings_("decimal_separator");

	const dec_c = (dec_p ? ", " : " \\ ");

	i = 0;
	formula = "";
	while (i < 12) {
		aux1 = "ARRAYFORMULA(SPLIT(CONCAT(\"" + MN_SHORT[i] + "-\"; \'" + MN_SHORT[i] + "\'!" + rollA1Notation(5, 1, -1, 1) + "); \"-\"))" + dec_c;
		aux1 += "\'" + MN_SHORT[i] + "\'!" + rollA1Notation(5, 2, -1, 1) + dec_c;
		aux1 += "\'" + MN_SHORT[i] + "\'!" + rollA1Notation(5, 5, -1, 1) + dec_c;
		aux1 += "\'" + MN_SHORT[i] + "\'!" + rollA1Notation(5, 3, -1, 2);

		aux1 = "{" + aux1 + "}; REGEXMATCH(\'" + MN_SHORT[i] + "\'!" + rollA1Notation(5, 4, -1, 1) + "; " + header + ")";
		aux1 = "FILTER(" + aux1 + ")";
		aux1 = "IFNA(" + aux1 + "; {\"\"" + dec_c + "\"\"" + dec_c + "\"\"" + dec_c + "\"\"" + dec_c + "\"\"" + dec_c + "\"\"})";
		aux1 = "SORT(" + aux1 + "; 2; TRUE; 4; TRUE; 5; TRUE); \n";
		formula += aux1;

		for (k = 0; k < num_acc; k++) {
			aux2 = "ARRAYFORMULA(SPLIT(CONCAT(\"" + MN_SHORT[i] + "-\"; \'" + MN_SHORT[i] + "\'!" + rollA1Notation(5, 6 + 5*k, -1, 1) + "); \"-\"))" + dec_c;
			aux2 += "\'" + MN_SHORT[i] + "\'!" + rollA1Notation(5, 7 + 5*k, -1, 1) + dec_c;
			aux2 += "\'" + MN_SHORT[i] + "\'!" + rollA1Notation(5, 10 + 5*k, -1, 1) + dec_c;
			aux2 += "\'" + MN_SHORT[i] + "\'!" + rollA1Notation(5, 8 + 5*k, -1, 2);

			aux2 = "{" + aux2 + "}; REGEXMATCH(\'" + MN_SHORT[i] + "\'!" + rollA1Notation(5, 9 + 5*k, -1, 1) + "; " + header + ")";
			aux2 = "FILTER(" + aux2 + ")";
			aux2 = "IFNA(" + aux2 + "; {\"\"" + dec_c + "\"\"" + dec_c + "\"\"" + dec_c + "\"\"" + dec_c + "\"\"" + dec_c + "\"\"})";
			aux2 = "SORT(" + aux2 + "; 2; TRUE; 4; TRUE; 5; TRUE); \n";
			formula += aux2;
		}

		aux3 = "ARRAYFORMULA(SPLIT(CONCAT(\"" + MN_SHORT[i] + "-\"; \'Cards\'!" + rollA1Notation(6, 1 + 6*i, -1, 1) + "); \"-\"))" + dec_c;
		aux3 += "\'Cards\'!" + rollA1Notation(6, 2 + 6*i, -1, 4);

		aux3 = "{" + aux3 + "}; REGEXMATCH(\'Cards\'!" + rollA1Notation(6, 5 + 6*i, -1, 1) + "; " + header + ")";
		aux3 = "FILTER(" + aux3 + ")";
		aux3 = "IFNA(" + aux3 + "; {\"\"" + dec_c + "\"\"" + dec_c + "\"\"" + dec_c + "\"\"" + dec_c + "\"\"" + dec_c + "\"\"})";
		aux3 = "SORT(" + aux3 + "; 2; TRUE; 4; TRUE; 5; TRUE); \n";
		formula += aux3;

		i++;
	}

	formula = formula.slice(0, -3);
	formula = "IF(D8 = \"\"; \"\"; QUERY({\n" + formula + "\n}; \"select * where Col6 is not null\"))";

	sheet.getRange("B12").setFormula(formula);

	sheetTags = spreadsheet.getSheetByName('Tags');
	if (sheetTags) n = sheetTags.getMaxRows();
	else n = 0;

	if (n > 1) {
		range = sheetTags.getRange(2, 5, n - 1, 1);

		rule = SpreadsheetApp.newDataValidation()
			.requireValueInRange(range, true)
			.setAllowInvalid(true)
			.build();

		sheet.getRange("D8").setDataValidation(rule);
	}

	sheet.setTabColor('#e69138');
	SpreadsheetApp.flush();
	spreadsheet.setActiveSheet(sheet);
}

function coolStatsForTags_(info) {
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var sheet = spreadsheet.getSheetByName(info.sheet_name);
	var sheetTags, range;
	var chart, options, n;

	sheet.getRange('E2').setFormula('\'_Settings\'!B4');
	sheet.getRange('E3').setFormula('\'_Settings\'!B6');

	sheet.getRange('B6').setFormula('QUERY({Tags!$B$1:$T}; "select Col1, sum(Col5), sum(Col6), sum(Col7), sum(Col8), sum(Col9), sum(Col10), sum(Col11), sum(Col12), sum(Col13), sum(Col14), sum(Col15), sum(Col16), sum(Col18), sum(Col19) where Col3=true or Col3=\'TRUE\' group by Col1"; 1)');

	chart = sheet.newChart()
		.addRange( sheet.getRange('B18:N28') )
		.setNumHeaders(1)
		.setChartType(Charts.ChartType.BAR)
		.setPosition(31, 2, 0, 0)
		.setTransposeRowsAndColumns(true)
		.setOption('mode', 'view')
		.setOption('legend', 'top')
		.setOption('title', 'Share per month')
		.setOption('focusTarget', 'category')
		.setOption('isStacked', 'percent')
		.setOption('backgroundColor', {fill: '#f3f3f3'})
		.setOption('height', 399)
		.setOption('width', 689);
	sheet.insertChart( chart.build() );

	chart = sheet.newChart()
		.addRange( sheet.getRange('B18:B28') )
		.addRange( sheet.getRange('O18:O28') )
		.setNumHeaders(1)
		.setChartType(Charts.ChartType.PIE)
		.setPosition(31, 9, 0, 0)
		.setOption('mode', 'view')
		.setOption('title', 'Average per category')
		.setOption('focusTarget', 'category')
		.setOption('backgroundColor', {fill: '#f3f3f3'})
		.setOption('height', 399)
		.setOption('width', 696);
	sheet.insertChart( chart.build() );

	options = {
		0:{color:"#cccccc", type:"bars"},
		1:{color:"#4285f4", type:"bars"},
		2:{color:"#ea4335", type:"line"}
	};

	chart = sheet.newChart()
		.addRange( sheet.getRange('B55:B67') )
		.addRange( sheet.getRange('I55:K67') )
		.setNumHeaders(1)
		.setChartType(Charts.ChartType.COMBO)
		.setPosition(53, 7, 0, 0)
		.setOption('mode', 'view')
		.setOption('legend', 'top')
		.setOption('focusTarget', 'category')
		.setOption('backgroundColor', {fill: '#f3f3f3'})
		.setOption('series', options)
		.setOption('height', 402)
		.setOption('width', 783);
	sheet.insertChart( chart.build() );

	chart = sheet.newChart()
		.addRange( sheet.getRange('B74:B84') )
		.addRange( sheet.getRange('D74:D84') )
		.setNumHeaders(1)
		.setChartType(Charts.ChartType.PIE)
		.setPosition(72, 7, 0, 0)
		.setOption('mode', 'view')
		.setOption('focusTarget', 'category')
		.setOption('backgroundColor', {fill: '#f3f3f3'})
		.setOption('height', 402)
		.setOption('width', 783);
	sheet.insertChart( chart.build() );

	sheetTags = spreadsheet.getSheetByName('Tags');
	n = sheetTags.getMaxRows();
	if (n > 1) {
		range = sheetTags.getRange(2, 5, n - 1, 1);

		rule = SpreadsheetApp.newDataValidation()
			.requireValueInRange(range, true)
			.setAllowInvalid(false)
			.build();

		sheet.getRange(92, 2, 1, 2).setDataValidation(rule);
	}

	sheet.getRange(92, 4).setFormula('IFERROR(MATCH(B92; Tags!E1:E; 0); 0)');
	sheet.getRange(95, 4).setFormula('IF(D92 > 0; ARRAYFORMULA(ABS(TRANSPOSE(OFFSET(Tags!E1; D92 - 1; 1; 1; 12)))); )');
	sheet.getRange(107, 4).setFormula('IF(D92 > 0; ARRAYFORMULA(ABS(TRANSPOSE(OFFSET(Tags!S1; D92 - 1; 0; 1; 2)))); )');

	options = {
		0:{color:"#cccccc", type:"bars"},
		1:{color:"#4285f4", type:"bars"},
		2:{color:"#ea4335", type:"line"}
	};

	chart = sheet.newChart()
		.addRange( sheet.getRange('B94:B106') )
		.addRange( sheet.getRange('I94:K106') )
		.setNumHeaders(1)
		.setChartType(Charts.ChartType.COMBO)
		.setPosition(92, 7, 0, 0)
		.setOption('mode', 'view')
		.setOption('legend', 'top')
		.setOption('focusTarget', 'category')
		.setOption('backgroundColor', {fill: '#f3f3f3'})
		.setOption('series', options)
		.setOption('height', 402)
		.setOption('width', 783);
	sheet.insertChart( chart.build() );

	sheet.setTabColor('#e69138');
	SpreadsheetApp.flush();
	spreadsheet.setActiveSheet(sheet);
}
