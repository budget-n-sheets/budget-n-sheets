var PATCH_THIS_ = Object.freeze({
	patch_list: [
		[
			null, [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ],
			[ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ],
			[ null, null, update_v0m21p2_, update_v0m21p3_, null, null ],
			[ update_v0m22p0_, update_v0m22p1_, update_v0m22p2_ ],
			[ null, null ],
			[ null, null, null, update_v0m24p3_, null, null ],
			[ update_v0m25p0_, null, update_v0m25p2_, null ],
			[ update_v0m26p0_, update_v0m26p1_, null, null ],
			[ update_v0m27p0_, null, null, null, null, null, null, update_v0m27p5_ ],
			[ update_v0m28p0_ ]
		]
	],
	beta_list: [ ]
});


function onlineUpdate_() {
	if (reviseVersion_()) return;

	const v0 = getClass_("script");
	const v1 = APPS_SCRIPT_GLOBAL_.script_version;

	if (v0.major > v1.major) return;
	if (v0.major == v1.major) {
		if (v0.minor > v1.minor) return;
		if (v0.minor == v1.minor) {
			if (v0.patch > v1.patch) return;
			if (v0.patch == v1.patch) {
				if (PATCH_THIS_["beta_list"].length == 0 || v0.beta >= PATCH_THIS_["beta_list"].length) return;
			}
		}
	}

	var ui = SpreadsheetApp.getUi();

	try {
		SpreadsheetApp.openById(APPS_SCRIPT_GLOBAL_.template_id);
	} catch (err) {
		consoleLog_("warn", "onlineUpdate_()", err);

		ui.alert(
			"New version available",
			"Please, re-open the spreadsheet to update the add-on.",
			ui.ButtonSet.OK);
		return 1;
	}

	showDialogUpdate();

	var r = update_();

	if (r === 0) {
		ui.alert(
			"Update successful",
			"The update process is complete!",
			ui.ButtonSet.OK);
		return;

	} else if (r === 1) {
		ui.alert(
			"Can't update",
			"The add-on is busy. Try again in a moment.",
			ui.ButtonSet.OK);

	} else if (r === 2) {
		ui.alert(
			"Update failed",
			"Something went wrong. Please, try again later.",
			ui.ButtonSet.OK);

	} else if (r > 2) {
		uninstall_();
		onOpen();
		showDialogErrorMessage();
	}

	return 1;
}


function seamlessUpdate_() {
	try {
		SpreadsheetApp.openById(APPS_SCRIPT_GLOBAL_.template_id);
	} catch (err) {
		consoleLog_("warn", "seamlessUpdate_()", err);
		return 1;
	}

	var r = update_();

	if (r === 0) return;
	if (r > 2) uninstall_();

	return 1;
}


function getClass_(o) {
	var c;

	c = getCacheService_("document", "class_version2", "json");
	if (!c) {
		c = getPropertiesService_("document", "json", "class_version2");
		putCacheService_("document", "class_version2", "json", c);
	}

	return c[o];
}


function setClass_(o, v) {
	if (o !== "script" && o !== "template") {
		consoleLog_("error", "setClass_(): Switch case is default", {o:o, v:v});
		return;
	}

	var c = getPropertiesService_("document", "json", "class_version2");

	c[o] = v;

	setPropertiesService_("document", "json", "class_version2", c);
	putCacheService_("document", "class_version2", "json", c);
}


/**
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 *
 * 0.0.0
 *
function update_v0m0p0_() {
	try {
	} catch (err) {
		consoleLog_("error", "update_v0m0p0_()", err);
		return 1;
	}
}*/

/**
 * Import new Cash Flow page.
 * Rename page About to _About BnS.
 * Set spreadsheet_settings property.
 * Transfer data from old Cash Flow.
 *
 * 0.28.0
 */
function update_v0m28p0_() {
	try {
		update_v0m28p0s1_();
		if (update_v0m28p0s2_()) return 1;
		if (update_v0m28p0s0_()) return 1;
		if (update_v0m28p0s3_()) return 1;
		update_v0m28p0s4_();
		update_v0m28p0s5_();
	} catch (err) {
		consoleLog_("error", "update_v0m28p0_()", err);
		return 1;
	}
}

/**
 * Set spreadsheet_settings property.
 */
function update_v0m28p0s2_() {
	try {
		var date, yyyy;
		var operation;

		date = getSpreadsheetDate(DATE_NOW);
		yyyy = date.getFullYear();

		const financial_year = getConstProperties_("financial_year");
		const decimal_separator = PropertiesService.getDocumentProperties().getProperty("decimal_separator");

		const dec_p = decimal_separator != null;

		if (financial_year < yyyy) {
			operation = "passive";
		} else if (financial_year == yyyy) {
			operation = "active";
		} else if (financial_year > yyyy) {
			operation = "passive";
		}

		const spreadsheet_settings = {
			operation_mode: operation,
			decimal_separator: dec_p,
			spreadsheet_locale: SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetLocale()
		};
		setPropertiesService_("document", "json", "spreadsheet_settings", spreadsheet_settings);
	} catch (err) {
		consoleLog_("error", "update_v0m28p0s2_()", err);
		return 1;
	}
}

/**
 * Rename page About to _About BnS.
 */
function update_v0m28p0s1_() {
	try {
		var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
		var sheet;

		sheet = spreadsheet.getSheetByName("About");
		if (sheet) {
			if (spreadsheet.getSheetByName("_About BnS")) {
				spreadsheet.deleteSheet(sheet);
				return;
			}

			sheet.setName("_About BnS");
		}
	} catch (err) {
		consoleLog_("error", "update_v0m28p0s1_()", err);
	}
}

/**
 * Backup Cash Flow page.
 * Import new Cash Flow page.
 */
function update_v0m28p0s0_() {
	try {
		var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
		var template = SpreadsheetApp.openById(APPS_SCRIPT_GLOBAL_.template_id);
		var sheet;
		var name, pos, n, i;

		i = 0;
		do {
			i++;
			name = "_Backup_Cash_Flow_" + i;
			sheet = spreadsheet.getSheetByName(name);
		} while (sheet && i < 100);
		if (i >= 100) throw new Error("Can't rename page.");

		sheet = spreadsheet.getSheetByName("Cash Flow");
		if (sheet) {
			pos = sheet.getIndex();
			n = spreadsheet.getNumSheets();
			if (n == 1) spreadsheet.insertSheet();

			spreadsheet.setActiveSheet(sheet);
			spreadsheet.moveActiveSheet(n);
			sheet.setName(name).hideSheet();
		} else {
			n = spreadsheet.getNumSheets();
			if (n < 15) pos = n;
			else pos = 15;
		}

		sheet = template.getSheetByName("Cash Flow")
			.copyTo(spreadsheet)
			.setName("Cash Flow")
			.setTabColor("#e69138");

		spreadsheet.setActiveSheet(sheet);
		spreadsheet.moveActiveSheet(pos);

		SpreadsheetApp.flush();
	} catch (err) {
		consoleLog_("error", "update_v0m28p0s0_()", err);
		return 1;
	}
}

/**
 * Install Cash Flow page.
 */
function update_v0m28p0s3_() {
	try {
		var sheet, ranges, formula;
		var b_f3f3f3, b_d9ead3;
		var d, s;
		var i, j, k;

		sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Cash Flow");
		if (!sheet) return 1;

		const h_ = TABLE_DIMENSION_.height;

		const init_month = setUserSettings_("initial_month");
		const dec_p = getSpreadsheetSettings_("decimal_separator");
		const num_acc = getConstProperties_("number_accounts");
		const financial_year = getConstProperties_("financial_year");

		const dec_c = (dec_p ? "," : "\\");
		const options = "{\"charttype\"" + dec_c + "\"column\"; \"color\"" + dec_c + "\"#93c47d\"; \"negcolor\"" + dec_c + "\"#e06666\"; \"empty\"" + dec_c + "\"ignore\"; \"nan\"" + dec_c + "\"ignore\"}";

		ranges = [ ];
		for (i = 0; i < 12; i++) {
			ranges[2*i] = sheet.getRange(4, 2 + 4*i, 31);
			ranges[2*i + 1] = sheet.getRange(4, 4 + 4*i, 31);
		}

		sheet.protect()
			.setUnprotectedRanges(ranges)
			.setWarningOnly(true);

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

		sheet.getRangeList(ranges).setFormulaR1C1("=R[-1]C + RC[-1]");
		sheet.getRangeList(b_f3f3f3).setBackground("#f3f3f3");
		sheet.getRangeList(b_d9ead3).setBackground("#d9ead3");

		SpreadsheetApp.flush();
	} catch (err) {
		consoleLog_("error", "update_v0m28p0s3_()", err);
		return 1;
	}
}

function update_v0m28p0s4_() {
	try {
		optMainTables("UpdateTableRef");
	} catch (err) {
		consoleLog_("error", "update_v0m28p0s4_()", err);
	}
}

/**
 * Transfer data from old Cash Flow.
 */
function update_v0m28p0s5_() {
	try {
		var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
		var source, destination;
		var n, i;

		const type = SpreadsheetApp.CopyPasteType.PASTE_VALUES;
		const financial_year = getConstProperties_("financial_year");

		destination = spreadsheet.getSheetByName("Cash Flow");
		if (!destination) return;

		i = 100;
		do {
			i--;
			source = spreadsheet.getSheetByName("_Backup_Cash_Flow_" + i);
		} while (!source && i > 0);
		if (i <= 0) return;

		i = 0;
		while (i < 12) {
			n = new Date(financial_year, i + 1, 0).getDate();

			source.getRange(3, 2 + 4*i, n, 1)
				.copyTo(destination.getRange(4, 2 + 4*i, n, 1), type);
			source.getRange(3, 4 + 4*i, n, 1)
				.copyTo(destination.getRange(4, 4 + 4*i, n, 1), type);

			i++;
		}
	} catch (err) {
		consoleLog_("error", "update_v0m28p0s5_()", err);
	}
}

/**
 * Copy user_const_settings to const_properties.
 * Add spreadsheet ID, and blank user and owner to const_properties.
 *
 * 0.27.5
 */
function update_v0m27p5_() {
	try {
		var const_properties = getPropertiesService_("document", "json", "user_const_settings");

		const_properties.user = "";
		const_properties.owner = "";
		const_properties.spreadsheet_id = SpreadsheetApp.getActiveSpreadsheet().getId();

		setPropertiesService_("document", "json", "const_properties", const_properties);
	} catch (err) {
		consoleLog_("error", "update_v0m27p5_()", err);
		return 1;
	}
}

/**
 * Update Cards headers.
 * Update cash flow range referencing.
 * Add credit limit difference equation.
 *
 * 0.27.0
 */
function update_v0m27p0_() {
	try {
		update_v0m27p0s0_();
		update_v0m27p0s1_();
	} catch (err) {
		consoleLog_("error", "update_v0m27p0_()", err);
	}
}

/**
 * Update Cards headers.
 */
function update_v0m27p0s0_() {
	try {
		var sheet, formula;
		var head, cell, max;
		var expr1, expr2, expr3;
		var i;

		const h_ = TABLE_DIMENSION_.height;
		const w_ = TABLE_DIMENSION_.width;

		const user_const_settings = getPropertiesService_("document", "json", "user_const_settings");
		const num_acc = user_const_settings.number_accounts;
		const dec_p = PropertiesService.getDocumentProperties().getProperty("decimal_separator");

		const col = 2 + w_ + w_*num_acc;
		const dec_c = (dec_p ? "," : "\\");
		const header = rollA1Notation(1, col, 1, w_*11);

		sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Cards");
		if (!sheet) return;

		max = sheet.getMaxColumns() + 1;

		i = 0;
		while (i < 12) {
			head = rollA1Notation(2, 1 + 6*i);
			cell = "\'_Backstage\'!" + rollA1Notation(2 + h_*i, col);

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
			i++;
		}
	} catch (err) {
		consoleLog_("error", "update_v0m27p0s0_()", err);
	}
}

/**
 * Add credit limit difference equation.
 */
function update_v0m27p0s1_() {
	try {
		var sheet, ranges, header;
		var maxColumns, maxRows;
		var i, k;

		const h_ = TABLE_DIMENSION_.height;
		const w_ = TABLE_DIMENSION_.width;

		const user_const_settings = getPropertiesService_("document", "json", "user_const_settings");
		const num_acc = user_const_settings.number_accounts;

		const col = 2 + w_ + w_*num_acc + w_;

		sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("_Backstage");
		if (!sheet) return;

		maxRows = sheet.getMaxRows() + 1;
		maxColumns = sheet.getMaxColumns() + 1;

		ranges = [ ];

		k = 0;
		while (k < 10) {
			header = rollA1Notation(1, col + w_*k);

			i = 0;
			while (i < 12) {
				ranges[12*k + i] = rollA1Notation(3 + h_*i, col + 1 + w_*k);
				i++;
			}

			k++;
		}

		sheet.getRangeList(ranges).setFormulaR1C1("MIN(R[-1]C; R[-1]C - R[3]C)");
	} catch (err) {
		consoleLog_("error", "update_v0m27p0s1_()", err);
	}
}


/**
 * Add BSCARDPART() in backstage.
 *
 * 0.26.1
 */
function update_v0m26p1_() {
	try {
		var sheet, formula;
		var max, col, x1, i, k;

		sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("_Backstage");
		if (!sheet) return;

		const h_ = TABLE_DIMENSION_.height;
		const w_ = TABLE_DIMENSION_.width;

		const user_const_settings = getPropertiesService_("document", "json", "user_const_settings");
		const num_acc = user_const_settings.number_accounts;
		const dec_p = PropertiesService.getDocumentProperties().getProperty("decimal_separator");

		col = 2 + w_ + w_*num_acc + w_;
		max = sheet.getMaxColumns() + 1;
		x1 = (dec_p == "[ ]" ? ", " : " \\ ");

		i = 0;
		while (i < 12 && 6 + 6*i < max) {
			for (k = 0; k < 10; k++) {
				formula = "ARRAYFORMULA(SPLIT(REGEXEXTRACT(\'Cards\'!" + rollA1Notation(6, 2 + 6*i, -1) + "; \"[0-9]+/[0-9]+\"); \"/\"))";
				formula = "{" + formula + x1 + "\'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + "}; REGEXMATCH(\'Cards\'!" + rollA1Notation(6, 3 + 6*i, -1) + "; " + rollA1Notation(1, col + w_*k) + "); ";
				formula += "NOT(ISBLANK(\'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + ")); ";
				formula += "REGEXMATCH(\'Cards\'!" + rollA1Notation(6, 2 + 6*i, -1) + "; \"[0-9]+/[0-9]+\")";
				formula = "BSCARDPART(TRANSPOSE(IFNA(FILTER(" + formula + ")";
				formula = "IF(" + rollA1Notation(1, col + w_*k) + " = \"\"; 0; " + formula + "; 0))))";

				sheet.getRange(5 + h_*i, 1 + col + w_*k).setFormula(formula);
			}

			i++;
		}
	} catch (err) {
		consoleLog_("error", "update_v0m26p1_()", err);
		return 1;
	}
}

/**
 *
 * 0.26.0
 */
function update_v0m26p0_() {
	try {
		var r;

		r = update_v0m26p0s0_();
		if (r) throw "v0m26p0s0";

		r = update_v0m26p0s1_();
		if (r) throw "v0m26p0s1";

		r = update_v0m26p0s2_();
		if (r) throw "v0m26p0s2";
	} catch (err) {
		consoleLog_('error', 'update_v0m26p0_()', err);
		return 1;
	}
}

/**
 * Add BSCARDPART() in backstage.
 * Update card filters.
 * Set limit equation.
 */
function update_v0m26p0s2_() {
	try {
		var sheet, ranges, formula;
		var header;
		var max, col, x1, i, k;

		sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("_Backstage");
		if (!sheet) return;

		const h_ = TABLE_DIMENSION_.height;
		const w_ = TABLE_DIMENSION_.width;

		const user_const_settings = getPropertiesService_("document", "json", "user_const_settings");
		const num_acc = user_const_settings.number_accounts;
		const dec_p = PropertiesService.getDocumentProperties().getProperty("decimal_separator");

		ranges = [ ];
		col = 2 + w_ + w_*num_acc + w_;
		max = sheet.getMaxColumns() + 1;
		x1 = (dec_p == "[ ]" ? ", " : " \\ ");

		header = [ ];
		for (k = 0; k < 10; k++) {
			header[k] = rollA1Notation(1, col + w_*k);
		}

		i = 0;
		while (i < 12 && 6 + 6*i < max) {
			for (k = 0; k < 10; k++) {
				formula = "IFERROR(IF(" + header[k] + " = \"\"; \"\"; SUM(FILTER(";
				formula += "\'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + "; ";
				formula += "REGEXMATCH(\'Cards\'!" + rollA1Notation(6, 3 + 6*i, -1) + "; " + header[k] + "); ";
				formula += "NOT(ISBLANK(\'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + ")); ";
				formula += "\'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + " >= 0";
				formula += "))); 0)"
				sheet.getRange(3 + h_*i, col + w_*k).setFormula(formula);

				formula = "IFERROR(IF(" + header[k] + " = \"\"; \"\"; SUM(FILTER(";
				formula += "\'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + "; ";
				formula += "REGEXMATCH(\'Cards\'!" + rollA1Notation(6, 3 + 6*i, -1) + "; " + header[k] + "); ";
				formula += "NOT(ISBLANK(\'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + ")); ";
				formula += "\'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + " < 0; ";
				formula += "NOT(REGEXMATCH(\'Cards\'!" + rollA1Notation(6, 5 + 6*i, -1) + "; ";
				formula += "\"#ign\"))";
				formula += "))); 0)"
				sheet.getRange(4 + h_*i, col + w_*k).setFormula(formula);

				formula = "IFERROR(IF(" + header[k] + " = \"\"; \"\"; SUM(FILTER(";
				formula += "\'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + "; ";
				formula += "REGEXMATCH(\'Cards\'!" + rollA1Notation(6, 3 + 6*i, -1) + "; " + header[k] + "); ";
				formula += "NOT(ISBLANK(\'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + ")); ";
				formula += "\'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + " < 0";
				formula += "))); 0)"
				sheet.getRange(5 + h_*i, col + w_*k).setFormula(formula);

				ranges[10*i + k] = rollA1Notation(6 + h_*i, 1 + col + w_*k);
			}

			i++;
		}

		sheet.getRangeList(ranges).setFormulaR1C1("R[-1]C + R[-4]C + RC[-1]");
	} catch (err) {
		consoleLog_("error", "update_v0m26p0s2_()", err);
		return 1;
	}
}

/**
 * Add aliases to card data.
 */
function update_v0m26p0s0_() {
	try {
		var db_tables, db_cards;
		var i;

		db_tables = getPropertiesService_("document", "json", "DB_TABLES");
		db_cards = db_tables.cards;

		if (db_cards.count == 0) return;

		for (i = 0; i < db_cards.count; i++) {
			db_cards.data[i].aliases = [ ];
		}

		db_tables.cards = db_cards;

		setPropertiesService_("document", "json", "DB_TABLES", db_tables);
	} catch (err) {
		consoleLog_("error", "update_v0m26p0s0_()", err);
		return 1;
	}
}

/**
 * Update card header.
 */
function update_v0m26p0s1_() {
	try {
		var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Cards");
		var formula, header, max, col, x1, i;

		if (!sheet) return;

		const h_ = TABLE_DIMENSION_.height;
		const w_ = TABLE_DIMENSION_.width;

		const user_const_settings = getPropertiesService_("document", "json", "user_const_settings");
		const num_acc = user_const_settings.number_accounts;
		const dec_p = PropertiesService.getDocumentProperties().getProperty("decimal_separator");

		col = 1 + w_ + w_*num_acc;
		max = sheet.getMaxColumns() + 1;
		x1 = (dec_p === "[ ]" ? "," : "\\");
		header = rollA1Notation(1, 2 + w_ + w_*num_acc, 1, w_*11);

		i = 0;
		while (i < 12 && 6 + 6*i < max) {
			formula = "ADDRESS(2 + " + (h_*i) + "; " +  col + " + " + rollA1Notation(2, 1 + 6*i) + "*5 + 1; 4; true; \"_Backstage\")";
			formula = "OFFSET(INDIRECT(" + formula + "); 4; 1; 1; 1)";
			formula = "TEXT(" + formula + "; \"#,##0.00;(#,##0.00)\")";
			formula = "IF(" + rollA1Notation(2, 2 + 6*i) + " = \"All\"; \"\"; " + formula + ")";
			formula = "CONCATENATE(\"AVAIL credit: \"; " + formula + ")";
			sheet.getRange(3, 1 + 6*i).setFormula(formula);

			formula = "INDIRECT(ADDRESS(2 + " + (h_*i) + "; " +  col + " + " + rollA1Notation(2, 1 + 6*i) + "*5 + 1; 4; true; \"_Backstage\"))";

			formula = "MAX(0; OFFSET(" + formula + "; 4; 1; 1; 1)); {\"charttype\"" + x1 + "\"bar\"; \"max\"" + x1 + "OFFSET(" + formula + "; 0; 1; 1; 1); \"color1\"" + x1 + "\"#45818e\"}";
			formula = "IF(" + rollA1Notation(2, 2 + 6*i) + " = \"All\"; \"\"; SPARKLINE(" + formula + "))";
			sheet.getRange(4, 1 + 6*i).setFormula(formula);

			formula = "REGEXMATCH(\'_Backstage\'!" + header + "; \"\\^\"&" + rollA1Notation(2, 2 + 6*i) + "&\"\\$\")"
			formula = "FILTER(\'_Backstage\'!" + header + "; " + formula + ")";
			formula = "INDEX(" + formula + "; 0; 1)";
			formula = "IF(" + rollA1Notation(2, 2 + 6*i) + " = \"All\"; 1; MATCH(" + formula + "; \'_Backstage\'!" + header + "; 0))";
			formula = "IFERROR((" + formula + " - 1)/5; \"\")";

			sheet.getRange(2, 1 + 6*i).setFormula(formula);

			i++;
		}
	} catch (err) {
		consoleLog_('error', 'update_v0m26p0s1_()', err);
		return 1;
	}
}

/**
 * Update name of keys for user settings.
 *
 * 0.25.2
 */
function update_v0m25p2_() {
	try {
		const user_settings = getPropertiesService_('document', 'json', 'user_settings');

		setUserSettings_("override_zero", user_settings.OverrideZero);
		setUserSettings_("post_day_events", user_settings.PostDayEvents);
		setUserSettings_("cash_flow_events", user_settings.CashFlowEvents);
	} catch (err) {
		consoleLog_('error', 'update_v0m25p2_()', err);
	}
}


/**
 * Update header layout in Cards to deprecate BSINFCARD().
 *
 * 0.25.0
 */
function update_v0m25p0_() {
	try {
		var sheet, formula;
		var ranges;
		var protections, protection;
		var a, c, m, i;

		sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Cards");
		if (!sheet) return;

		const user_const_settings = getPropertiesService_("document", "json", "user_const_settings");
		const number_accounts = user_const_settings.number_accounts;

		const h_ = TABLE_DIMENSION_.height;
		const w_ = TABLE_DIMENSION_.width;

		protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
		for (i = 0; i < protections.length; i++) {
			protection = protections[i];
			if (protection.canEdit()) {
				protection.remove();
			}
		}

		a = sheet.getMaxColumns();
		m = sheet.getMaxRows() - 5;

		ranges = [ ];
		c = 1 + w_ + w_*number_accounts;
		header = rollA1Notation(1, c + 1, 1, w_*11);

		if (m < 1) return;

		i = 0;
		while (i < 12 && 6*i < a) {
			sheet.getRange(2, 1 + 6*i, 1, 3).breakApart();

			sheet.getRange(2, 1 + 6*i)
				.clearDataValidations()
				.setHorizontalAlignment("right")
				.setValue(null)
				.setFontColor("#f9cb9c")
				.setNumberFormat("0");

			sheet.getRange(2, 2 + 6*i, 1, 2)
				.setValue("All")
				.merge();

			formula = "MATCH(" + rollA1Notation(2, 2 + 6*i) + "; \'_Backstage\'!" + header + "; 0)";
			formula = "IFERROR((" + formula + " - 1)/5; \"\")";
			sheet.getRange(2, 1 + 6*i).setFormula(formula);

			formula = "IF(" + rollA1Notation(2, 1 + 6*i) + " <> \"\"; CONCATENATE(";

			formula += "\"Credit: \"; ";
			formula += "TEXT(OFFSET(INDIRECT(ADDRESS(2 + " + (h_*i) + "; " +  c + " + " + rollA1Notation(2, 1 + 6*i) + "*5 + 1; 4; true; \"_Backstage\")); 1; 0; 1; 1); \"#,##0.00;(#,##0.00)\"); ";
			formula += "\"\n\"; ";

			formula += "\"Expenses: \"; ";
			formula += "TEXT(OFFSET(INDIRECT(ADDRESS(2 + " + (h_*i) + "; " +  c + " + " + rollA1Notation(2, 1 + 6*i) + "*5 + 1; 4; true; \"_Backstage\")); 3; 0; 1; 1); \"#,##0.00;(#,##0.00)\"); ";
			formula += "\"\n\"; ";

			formula += "\"\n\"; ";

			formula += "\"Balance: \"; ";
			formula += "TEXT(OFFSET(INDIRECT(ADDRESS(2 + " + (h_*i) + "; " +  c + " + " + rollA1Notation(2, 1 + 6*i) + "*5 + 1; 4; true; \"_Backstage\")); 4; 0; 1; 1); \"#,##0.00;(#,##0.00)\")";

			formula += "); \"\")";
			sheet.getRange(2, 4 + 6*i).setFormula(formula);

			ranges[2*i] = sheet.getRange(2, 2 + 6*i, 1, 2);
			ranges[1 + 2*i] = sheet.getRange(6, 1 + 6*i, m, 5);

			i++;
		}

		sheet.protect().setUnprotectedRanges(ranges).setWarningOnly(true);
	} catch (err) {
		consoleLog_('error', 'update_v0m25p0_()', err);
		return 1;
	}
}


/**
 * Update conditional formatting in Summary.
 * Update conditional formatting in Tags.
 *
 * 0.24.3
 */
function update_v0m24p3_() {
	try {
		var sheet;

		sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("_Settings");
		if (!sheet) return;

		sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Summary");
		update_v0m24p3s0_(sheet);

		sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Tags");
		update_v0m24p3s1_(sheet);
	} catch (err) {
		consoleLog_('error', 'update_v0m24p3_()', err);
	}
}

/**
 * Update conditional formatting in Summary.
 */
function update_v0m24p3s0_(sheet) {
	try {
		if (!sheet) return;
		if (sheet.getMaxRows() < 22) return;
		if (sheet.getMaxColumns() < 9) return;

		var range, rules, rule;

		sheet.clearConditionalFormatRules();

		rules = sheet.getConditionalFormatRules();

		range = sheet.getRange(11, 8, 12, 2);
		rule = SpreadsheetApp.newConditionalFormatRule()
			.whenNumberLessThan(0.0)
			.setFontColor("#c53929")
			.setBold(true)
			.setRanges([ range ])
			.build();
		rules.push(rule);

		range = sheet.getRange(11, 2, 12, 8);
		rule = SpreadsheetApp.newConditionalFormatRule()
			.whenFormulaSatisfied("=ROW() - 10 < INDIRECT(\"'_Settings'!B4\")")
			.setFontColor("#cccccc")
			.setRanges([ range ])
			.build();
		rules.push(rule);

		range = sheet.getRange(11, 2, 12, 8);
		rule = SpreadsheetApp.newConditionalFormatRule()
			.whenFormulaSatisfied("=ROW() - 10 > INDIRECT(\"'_Settings'!B4\") - 1 + INDIRECT(\"'_Settings'!B6\")")
			.setFontColor("#999999")
			.setRanges([ range ])
			.build();
		rules.push(rule);

		sheet.setConditionalFormatRules(rules);
	} catch (err) {
		consoleLog_('error', 'update_v0m24p3s0_()', err);
	}
}

/**
 * Update conditional formatting in Tags.
 */
function update_v0m24p3s1_(sheet) {
	try {
		if (!sheet) return;
		if (sheet.getMaxColumns() < 17) return;

		var range, rules, rule, n;

		n = sheet.getMaxRows() - 1;
		if (n < 1) return;

		sheet.clearConditionalFormatRules();

		rules = sheet.getConditionalFormatRules();

		range = sheet.getRange(2, 6, n, 12);
		rule = SpreadsheetApp.newConditionalFormatRule()
			.whenFormulaSatisfied("=COLUMN() - 5 < INDIRECT(\"'_Settings'!B4\")")
			.setFontColor("#cccccc")
			.setRanges([ range ])
			.build();
		rules.push(rule);

		range = sheet.getRange(2, 6, n, 12);
		rule = SpreadsheetApp.newConditionalFormatRule()
			.whenFormulaSatisfied("=COLUMN() - 5 > INDIRECT(\"'_Settings'!B4\") - 1 + INDIRECT(\"'_Settings'!B6\")")
			.setFontColor("#999999")
			.setRanges([ range ])
			.build();
		rules.push(rule);

		sheet.setConditionalFormatRules(rules);
	} catch (err) {
		consoleLog_('error', 'update_v0m24p3s1_()', err);
	}
}


/**
 * Fix 'financial_calendar' value.
 *
 * 0.22.2
 */
function update_v0m22p2_() {
	try {
		const financial_calendar = getUserSettings_('financial_calendar');
		if (financial_calendar == "") return;

		const db_calendars = getAllOwnedCalendars();
		var c;

		c = db_calendars.md5.indexOf(financial_calendar);
		if (c !== -1) setUserSettings_('financial_calendar', db_calendars.id[c]);
	} catch (err) {
		consoleLog_('error', 'update_v0m22p2_()', err);
	}
}

/**
 * Reinstall triggers if transition year service failed.
 * Delete property 'DB_CALENDARS'.
 * Fix 'user_settings' where update_v0m21p2_() failed.
 *
 * 0.22.1
 */
function update_v0m22p1_() {
	try {
		update_v0m22p1s0_();
		Utilities.sleep(200);

		update_v0m22p1s1_();
		Utilities.sleep(200);
	} catch (err) {
		consoleLog_('error', 'update_v0m22p1_()', err);
	}
}

/**
 * Delete property 'DB_CALENDARS'.
 *
 */
function update_v0m22p1s1_() {
	try {
		deletePropertiesService_('document', 'DB_CALENDARS');
	} catch (err) {
		consoleLog_('error', 'update_v0m22p1s1_()', err);
	}
}

/**
 * Fix 'user_settings' where update_v0m21p2_() failed.
 *
 */
function update_v0m22p1s0_() {
	try {
		const user_settings = getPropertiesService_('document', 'json', 'user_settings');
		var mm;

		if (user_settings.initial_month == null) {
			mm = new Date().getMonth();
			if (mm > 0) mm--;

			user_settings.initial_month = mm;
			user_settings.financial_calendar = "";
			user_settings.spreadsheet_locale = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetLocale();
		}

		setPropertiesService_('document', 'json', 'user_settings', user_settings);
	} catch (err) {
		consoleLog_('error', 'update_v0m22p1s0_()', err);
	}
}

/**
 * Merge and update db of cards and accounts in one table.
 *
 * 0.22.0
 */
function update_v0m22p0_() {
	try {
		if (getPropertiesService_('document', '', 'DB_TABLES')) return;

		update_v0m21p3_();
	} catch (err) {
		consoleLog_('error', 'update_v0m22p0_()', err);
		return 1;
	}
}

/**
 * Merge and update db of cards and accounts in one table.
 *
 * 0.21.3
 */
function update_v0m21p3_() {
	try {
		var db_tables, cell, ids;
		var i, k, r;

		r = randomString(7, "lonum");
		ids = [ r ];

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

		const db_accounts = getPropertiesService_('document', 'json', 'DB_ACCOUNT');
		const db_cards = getPropertiesService_('document', 'json', 'DB_CARD');

		for (k = 0; k < db_accounts.length; k++) {
			i = 0;
			do {
				r = "" + randomString(7, "lonum");
				i++;
			} while (ids.indexOf(r) != -1 && i < 99);
			if (i >= 99) throw "Could not generate unique ID for account.";

			ids.push(r);
			db_tables.accounts.ids.push(r);

			cell = {
				id: r,
				name: db_accounts[k].Name,
				balance: db_accounts[k].Balance,
				time_a: db_accounts[k].TimeA,
				time_z: 11
			};

			db_tables.accounts.names.push(db_accounts[k].Name);
			db_tables.accounts.data.push(cell);
		}

		db_tables.cards.count = db_cards.length;

		for (k = 0; k < db_cards.length; k++) {
			i = 0;
			do {
				r = "" + randomString(7, "lonum");
				i++;
			} while (ids.indexOf(r) != -1 && i < 99);
			if (i >= 99) throw "Could not generate unique ID for account.";

			ids.push(r);
			db_tables.cards.ids.push(r);

			cell = {
				id: r,
				name: db_cards[k].Name,
				code: db_cards[k].Code,
				limit: db_cards[k].Limit
			};

			db_tables.cards.codes.push(db_cards[k].Code);
			db_tables.cards.data.push(cell);
		}

		setPropertiesService_('document', 'json', 'DB_TABLES', db_tables);
	} catch (err) {
		consoleLog_('error', 'update_v0m21p3_()', err);
		return 1;
	}
}

/**
 * Set MD5 of selected financial calendar ID.
 * Update calendars DB.
 * Rename settings properties names.
 *
 * 0.21.2
 */
function update_v0m21p2_() {
	try {
		var user_settings, financial_calendar;
		var db_calendars, calendars;
		var digest, i;

		user_settings = getPropertiesService_('document', 'json', 'user_settings');

		user_settings.initial_month = user_settings.InitialMonth;
		user_settings.financial_calendar = user_settings.FinancialCalendar;
		user_settings.spreadsheet_locale = user_settings.SpreadsheetLocale;

		setPropertiesService_('document', 'json', 'user_settings', user_settings);

		db_calendars = getAllOwnedCalendars();

		financial_calendar = user_settings.financial_calendar;
		if (financial_calendar == "") return;

		for (i = 0; i < db_calendars.id.length; i++) {
			digest = computeDigest("SHA_1", db_calendars.id[i], "UTF_8");

			if (financial_calendar == digest) {
				setUserSettings_('financial_calendar', db_calendars.md5[i]);
				break;
			}
		}
	} catch (err) {
		consoleLog_('error', 'update_v0m21p2_()', err);
	}
}
