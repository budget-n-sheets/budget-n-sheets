function setupSummary_() {
	var sheet = SPREADSHEET.getSheetByName("Summary");
	var chart, options;

	const h_ = TABLE_DIMENSION.height;

	options = {
		0: {color: "#b7b7b7", type: "bars", labelInLegend: "Income"},
		1: {color: "#cccccc", type: "bars", labelInLegend: "Expenses"},
		2: {color: "#45818e", type: "bars", labelInLegend: "Income"},
		3: {color: "#e69138", type: "bars", labelInLegend: "Expenses"},
		4: {color: "#45818e", type: "line", labelInLegend: "Avg Income"},
		5: {color: "#e69138", type: "line", labelInLegend: "Avg Expenses"}
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
		.addRange( sheet.getRange("C25:I36") )
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
}
