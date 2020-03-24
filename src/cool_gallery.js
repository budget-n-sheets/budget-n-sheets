function coolGallery(option) {
	var lock, s;
	var info;

	info = AppsScriptGlobal.CoolGallery();
	info = info[option];
	if (!info) {
		consoleLog_('warn', 'getCoolSheet_(): Details of page not found.', {"option":option, "info":info});
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
		consoleLog_('warn', 'getCoolSheet_()', err);
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
	var text, aux1, aux2;
	var n, i, k;

	const header = "C8";
	const num_acc = getUserConstSettings_('number_accounts');

	sheet.getRange("B8").setFormula("IF(C8 = \"\"; \"\"; \"#\")");

	i = 0;
	formula = "";
	while (i < 12) {
		aux1 = "";
		aux2 = "";

		for (k = 0; k < num_acc; k++) {
			aux1 += "; \'" + MN_SHORT_[i] + "\'!" + rollA1Notation(5, 6 + 5*k, -1, 4);
			aux2 += "; \'" + MN_SHORT_[i] + "\'!" + rollA1Notation(5, 9 + 5*k, -1);
		}

		text = "REGEXMATCH({\'" + MN_SHORT_[i] + "\'!D5:D" + aux2 + "}; " + header + ")";
		text = "FILTER({\'" + MN_SHORT_[i] + "\'!A5:D" + aux1 + "}; " + text + ")";
		text = "SORT(" + text + "; 1; TRUE; 3; FALSE)";
		text = "IFERROR(" + text + "; {\"\", \"\", \"\", \"\"})";
		text = "{\"\", \"" + MN_FULL_[i] + "\", \"\", \"\"}; " + text + "; ";
		formula += text;

		i++;
	}

	formula = formula.slice(0, -2);
	formula = "IF(C8 = \"\"; \"\"; {" + formula + "})";

	sheet.getRange("B11").setFormula(formula);

	sheetTags = spreadsheet.getSheetByName('Tags');
	if (sheetTags) n = sheetTags.getMaxRows();
	else n = 0;

	if (n > 1) {
		range = sheetTags.getRange(2, 5, n - 1, 1);

		rule = SpreadsheetApp.newDataValidation()
			.requireValueInRange(range, true)
			.setAllowInvalid(true)
			.build();

		sheet.getRange("C8").setDataValidation(rule);
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
