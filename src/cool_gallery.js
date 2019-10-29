function optCoolGallery(command, options) {
	// var lock = LockService.getDocumentLock();
	// var r = 1;
	// try {
	// 	lock.waitLock(200);
	// } catch (err) {
	// 	return 0;
	// }

	switch (command) {
		case "import":
			return getCoolSheet_(options);

		default:
			console.warn("optCoolGallery(): Switch case is default.", command);
			break;
	}
}


function getCoolSheet_(option) {
	var ui = SpreadsheetApp.getUi();

	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var template;

	var cool_gallery = AppsScriptGlobal.CoolGallery();
	var info;
	var r;

	info = cool_gallery[option];
	if (!info) {
		showDialogErrorMessage();
		console.warn("getCoolSheet(): Details of sheet not found.", {"option":option, "info":info});
		return 1;
	}

	sheet = spreadsheet.getSheetByName(info.sheet_name);
	if (sheet) {
		ui.alert(
			"Can't import analytics sheet",
			"A sheet with the name \"" + info.sheet_name + "\" already exists. Please rename, or delete the sheet.",
			ui.ButtonSet.OK
		);
		return -1;
	}

	try {
		template = SpreadsheetApp.openById(info.id);
	} catch (err) {
		showDialogErrorMessage();
		console.warn("getCoolSheet()", err);
		return 1;
	}

	template.getSheetByName(info.sheet_name)
		.copyTo(spreadsheet)
		.setName(info.sheet_name);

	sheet = spreadsheet.getSheetByName(info.sheet_name);
	SpreadsheetApp.flush();

	r = -1;
	switch (option) {
		case "tags":
			r = coolTags_(info);
			break;

		default:
			break;
	}

	if (r === -1) {
		spreadsheet.setActiveSheet(sheet);
	} else {
		spreadsheet.deleteSheet(sheet);
	}

	return r;
}


function coolTags_(info) {
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var sheet = spreadsheet.getSheetByName(info.sheet_name);
	var chart, options;

	sheet.getRange('E2').setFormula('\'_Settings\'!B4');
	sheet.getRange('E3').setFormula('\'_Settings\'!B5');

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
		0:{type:'bars'},
		1:{type:'line'}
	};

	chart = sheet.newChart()
		.addRange( sheet.getRange('B55:D67') )
		.addRange( sheet.getRange('J55:J67') )
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

	SpreadsheetApp.flush();
	return -1;
}
