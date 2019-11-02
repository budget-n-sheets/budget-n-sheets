function onlineUpdate_() {
	var ui = SpreadsheetApp.getUi();
	try {
		SpreadsheetApp.openById( AppsScriptGlobal.TemplateId() );
	} catch (err) {
		console.warn("onlineUpdate_()", err);

		ui.alert(
			"Add-on Update",
			"Please re-open the spreadsheet to update the add-on.",
			ui.ButtonSet.OK);
		return true;
	}

	var version = optGetClass_("AddonVersion");
	if (version === AppsScriptGlobal.AddonVersion()) return;

	showDialogQuickMessage("Add-on Update", "The add-on is updating...", false, true);

	var b = update_ExecutePatial_();
	if (b === -1) {
		ui.alert(
			"Add-on Update",
			"Update is complete.",
			ui.ButtonSet.OK);
		return;
	}

	if (b === 1) {
		uninstall_();
		showDialogErrorMessage();
		onOpen();
	} else {
		ui.alert("Budget n Sheets",
			"The add-on is busy. Try again in a moment.",
			ui.ButtonSet.OK);
	}

	return true;
}

function seamlessUpdate_() {
	try {
		SpreadsheetApp.openById( AppsScriptGlobal.TemplateId() );
	} catch (err) {
		console.warn("seamlessUpdate_()", err);
		return true;
	}

	var version = optGetClass_("AddonVersion");
	if (version === AppsScriptGlobal.AddonVersion()) return;

	var b = update_ExecutePatial_();
	if (b === -1) return;
	if (b === 1) uninstall_();

	return true;
}


function optGetClass_(a) {
	if (typeof a != "string") return;

	var b = getPropertiesService_("document", "json", "class_version");

	return b[a];
}

function optSetClass_(a, b) {
	if (typeof a != "string") return;

	var c = getPropertiesService_("document", "json", "class_version");

	switch (a) {
		case "AddonVersion":
		case "AddonVersionName":
		case "TemplateVersion":
		case "TemplateVersionName":
			c[a] = b;
			break;
		default:
			console.error("optSetClass_(): Switch case is default", a, b);
			break;
	}

	setPropertiesService_("document", "json", "class_version", c);
}


var HEAD_EP = 67;
function update_ExecutePatial_() {
	if (!getPropertiesService_("document", "", "is_installed")) return 1;

	var lock = LockService.getDocumentLock();
	try {
		lock.waitLock(2000);
	} catch (err) {
		console.warn("update_ExecutePatial_(): Wait lock time out.");
		return 0;
	}

	var load;
	var c = false;
	var v0 = optGetClass_("AddonVersion"),
			v1 = AppsScriptGlobal.AddonVersion();

	if (HEAD_EP != HEAD_AG) {
		load = {
			value_v0: v0,
			type_v0: typeof v0,
			value_v1: v1,
			type_v1: typeof v1,
			v0ev1: v0 == v1,
			head_ep: HEAD_EP,
			head_ag: HEAD_AG,
			isEPeAG: HEAD_EP = HEAD_AG
		};
		console.warn("update_ExecutePatial_(): HEAD_EP not equal to HEAD_AG.", load);
		return 0;
	}

	switch (v0) {
		case 56:
			c = update0pack03_();
			if (c) break;

		case 57:
			update0pack04_();

		case 58:
			update0pack05_();

		case 59:
			c = update0pack06_();
			if (c) break;

		case 60:
		case 61:
			update0pack07_();

		case 62:
			update0pack08_();

		case 63:
			update0pack09_();
			update0pack10_();

		case 64:
			update0pack11_();

		case 65:
			c = update0pack12_();
			if (c) break;

		case 66:
			c = update0pack13_();
			if (c) break;

		case 67:
			update_v0m19p0_();
			update_v0m19p1_();

		case 68:
			update_v0m19p2_();
			break;

		default:
			load = {
				value_v0: v0,
				type_v0: typeof v0,
				value_v1: v1,
				type_v1: typeof v1,
				v0ev1: v0 == v1
			};
			console.warn("update_ExecutePatial_(): Switch case is default.", load);
			return 0;
	}

	if (c) {
		console.info("add-on/update-fail");
		return 1;
	}

	optSetClass_("AddonVersion", v1);
	SpreadsheetApp.flush();

	console.info("add-on/update");
	return -1;
}

/**
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 *
 * 0.0.0
 *
function update_v0m0p0_() {
	try {
	} catch (err) {
		console.error("update_v0m0p0_()", err);
		return true;
	}
}*/

/**
 * Set new function to count tags.
 * Reset function Total of tags.
 *
 * 0.19.0
 */
function update_v0m19p2_() {
	try {
		var sheet, formula;

		sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('_Settings');
		if (!sheet) return;

		sheet.getRange('B7').setFormula("COUNTIF(\'Tags\'!$E1:$E; \"\") - 1");

		sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Tags');
		if (!sheet) return;

		formula = "IF(COLUMN(" + rollA1Notation(2, 6, -1, 12) + ") - 5 < \'_Settings\'!$B$4 + \'_Settings\'!$B$6; ROW(" + rollA1Notation(2, 6, -1) + "); 0)";
		formula = "IF(COLUMN(" + rollA1Notation(2, 6, -1, 12) + ") - 5 >= \'_Settings\'!$B$4; " + formula + "; 0)";
		formula = "ARRAYFORMULA(SUMIF(" + formula + "; ROW(" + rollA1Notation(2, 6, -1) + "); " + rollA1Notation(2, 6, -1) + "))";
		formula = "IF(\'_Settings\'!$B$6 > 0; " + formula + "; ARRAYFORMULA($F$2:$F * 0))";
		formula = "IF(\'_Settings\'!$B$7 > 0; " + formula + "; \"\")";
		formula = "{\"Total\"; " + formula + "}";
		sheet.getRange(1, 20).setFormula(formula);
	} catch (err) {
		console.error("update_v0m19p2_()", err);
		return true;
	}
}

/**
 * Set unprotected ranges, insert checkboxes, set data validation for tag category.
 *
 * 0.19.0
 */
function update_v0m19p1_() {
	try {
		var sheet, protections, rule;
		var n, i;

		sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Tags');
		if (!sheet) return;

		n = sheet.getMaxRows() - 1;
		if (n < 1) return;
		if (n < 30) {
			sheet.insertRowsAfter(n, 30 - n);
			n += 30 - n;
		}

		if (sheet.getMaxColumns() < 5) return;
		if (sheet.getMaxColumns() >= 22) sheet.deleteColumns(21, 2);

		protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
		for (i = 0; i < protections.length; i++) {
			if (protections[i].canEdit()) protections[i].remove();
		}

		rule = sheet.getRange(2, 1, n, 5);
		sheet.protect()
			.setUnprotectedRanges([ rule ])
			.setWarningOnly(true);

		rule = SpreadsheetApp.newDataValidation()
			.requireValueInList(TC_NAME_, true)
			.setAllowInvalid(true)
			.build();
		sheet.getRange(2, 2, n, 1).setDataValidation(rule);

		sheet.getRange(2, 4, n, 1).insertCheckboxes();
		rule = SpreadsheetApp.newDataValidation()
			.requireCheckbox()
			.build();
		sheet.getRange(2, 4, n, 1).setDataValidation(rule);
	} catch (err) {
		console.error("update_v0m19p1_()", err);
		return true;
	}
}

/**
 * Set conditional format based on standard tags.
 *
 * 0.19.0
 */
function update_v0m19p0_() {
	try {
		var spreadsheet, sheet, rules, rule, range;
		var number_accounts;
		var n, i, k;
		var w_;

		w_ = AppsScriptGlobal.TableDimensions()['width'];
		number_accounts = getUserConstSettings_('number_accounts');

		spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

		for (i = 0; i < 12; i++) {
			sheet = spreadsheet.getSheetByName(MN_SHORT_[i]);
			if (!sheet) continue;

			n = sheet.getMaxRows() - 4;
			if (n < 1) continue;

			rules = sheet.getConditionalFormatRules();

			range = sheet.getRange(5, 1, n, 4);

			range.setBackground('#ffffff');
			range.setFontColor('#000000');

			rule = SpreadsheetApp.newConditionalFormatRule()
				.whenFormulaSatisfied("=REGEXMATCH($" + rollA1Notation(5, 4) + "; \"#ign\")")
				.setFontColor("#999999")
				.setRanges([ range ])
				.build();
			rules.push(rule);

			for (k = 1; k <= number_accounts; k++) {
				range = sheet.getRange(5, 1 + w_*k, n, 4);

				range.setBackground('#ffffff');
				range.setFontColor('#000000');

				rule = SpreadsheetApp.newConditionalFormatRule()
					.whenFormulaSatisfied("=REGEXMATCH($" + rollA1Notation(5, 4 + w_*k) + "; \"#(dp|wd|qcc|rct|trf)\")")
					.setBackground("#d9d2e9")
					.setRanges([ range ])
					.build();
				rules.push(rule);

				rule = SpreadsheetApp.newConditionalFormatRule()
					.whenFormulaSatisfied("=REGEXMATCH($" + rollA1Notation(5, 4 + w_*k) + "; \"#ign\")")
					.setFontColor("#999999")
					.setRanges([ range ])
					.build();
				rules.push(rule);
			}

			sheet.setConditionalFormatRules(rules);
		}
	} catch (err) {
		console.error("update_v0m19p0_()", err);
		return true;
	}
}

/**
 * Create property for const user settings.
 *
 * 0.18.17
 */
function update0pack13_() {
	try {
		var user_const_settings;
		var date_created, number_accounts, financial_year;

		financial_year = getUserSettings_("FinancialYear");
		number_accounts = getUserConstSettings_('number_accounts');

		user_const_settings = {
			date_created: 0,
			number_accounts: number_accounts,
			financial_year: financial_year
		};

		setPropertiesService_('document', 'obj', 'user_const_settings', user_const_settings);
	} catch (err) {
		console.error("update0pack13_()", err);
		return true;
	}
}

/**
 * Fill with zeros columns Average and Total when M factor is zero.
 * Replace bool with words the analytics of tags.
 *
 * 0.18.15
 */
function update0pack12_() {
	try {
		var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
		var sheet, data;
		var i, n;

		n = getUserConstSettings_('number_accounts');
		setupPart4_(spreadsheet, n);

		sheet = spreadsheet.getSheetByName("Tags");
		n = sheet.getMaxRows();
		if (n > 2) {
			data = sheet.getRange(1, 4, n, 1).getValues();
			for (i = 1; i < n; i++) {
				if (data[i][0] === "true") data[i][0] = "TRUE";
				else data[i][0] = "FALSE";
			}
			sheet.getRange(1, 4, n, 1).setValues(data);
		}
	} catch (err) {
		console.error("update0pack12_()", err);
		return true;
	}
}

/**
 * Fix range reference for codes of tags.
 *
 * 0.18.14
 */
function update0pack11_() {
	try {
		var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
		var n = getUserConstSettings_('number_accounts');
		var c;

		setupPart4_(spreadsheet, n);
	} catch (err) {
		console.error("update0pack11_()", err);
		return true;
	}
}

/**
 * Delete and re-add sheet "Quick Actions".
 *
 * 0.18.12 part 2
 */
function update0pack10_() {
	try {
		var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
		var sheet, range;
		var template;
		var n;

		sheet = spreadsheet.getSheetByName("Quick Actions");

		if (sheet) {
			n = sheet.getIndex();
			spreadsheet.deleteSheet(sheet);
		} else {
			n = spreadsheet.getSheets().length;
			if (n.length >= 16) n = 16;
		}

		template = SpreadsheetApp.openById( AppsScriptGlobal.TemplateId() );
		template.getSheetByName("Quick Actions")
			.copyTo(spreadsheet)
			.setName("Quick Actions")
			.setTabColor('#6aa84f');

		sheet = spreadsheet.getSheetByName("Quick Actions");
		spreadsheet.setActiveSheet(sheet);
		spreadsheet.moveActiveSheet(n);

		range = [ ];
		range.push( sheet.getRange(4, 2, 3, 1) );
		range.push( sheet.getRange(9, 2, 2, 1) );
		range.push( sheet.getRange(13, 1, 1, 2) );

		sheet.protect()
			.setUnprotectedRanges(range)
			.setWarningOnly(true);
	} catch (err) {
		console.error("update0pack10_()", err);
		return true;
	}
}

/**
 * Show or hide data range based on initial month.
 * Set conditional formatting for data range on active months.
 *
 * 0.18.12 part 1
 */
function update0pack09_() {
	try {
		var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
		var sheet, range, rules, rule;
		var template;
		var n, i;
		var h_ = AppsScriptGlobal.TableDimensions()["height"];

		sheet = spreadsheet.getSheetByName("Summary");

		sheet.getRange('M2:M3')
			.setFontColor('#b7b7b7')
			.setFontWeight("bold")
			.setNumberFormat("0");
		sheet.getRange('M2').setFormula('\'_Settings\'!B4');
		sheet.getRange('M3').setFormula('\'_Settings\'!B3');

		for (i = 0; i < 12; i++) {
			sheet.getRange(25 + i, 3).setValue(MN_FULL_[i]);
			sheet.getRange(25 + i, 4).setFormula('IF(ROW() - 24 < $M$2; ' + rollA1Notation(11 + i, 4) + ';)');
			sheet.getRange(25 + i, 5).setFormula('IF(ROW() - 24 < $M$2; -' + rollA1Notation(11 + i, 6) + ';)');
			sheet.getRange(25 + i, 6).setFormula('IF(ROW() - 24 < $M$2; ; ' + rollA1Notation(11 + i, 4) + ')');
			sheet.getRange(25 + i, 7).setFormula('IF(ROW() - 24 < $M$2; ; -' + rollA1Notation(11 + i, 6) + ')');
		}

		sheet.getRange(25, 4).setFormula('IF(ROW() - 24 < $M$2; ' + rollA1Notation(11, 4) + '; 0)');
		sheet.getRange(25, 5).setFormula('IF(ROW() - 24 < $M$2; -' + rollA1Notation(11, 6) + '; 0)');


		sheet.clearConditionalFormatRules();
		sheet.getRange(11, 2, 12, 8).setFontColor("#000000");

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
			.whenFormulaSatisfied("=ROW() - 10 < $M$2")
			.setFontColor("#b7b7b7")
			.setRanges([ range ])
			.build();
		rules.push(rule);

		sheet.setConditionalFormatRules(rules);


		sheet = spreadsheet.getSheetByName("_Backstage");

		n = sheet.getMaxColumns();
		sheet.getRange(2, 1, h_*12 - 1, n).setFontColor("#000000");
	} catch (err) {
		console.error("update0pack09_()", err);
		return true;
	}
}

/**
 * Call monthly_TreatLayout_().
 *
 * 0.18.8
 */
function update0pack08_() {
	try {
		var date = getSpreadsheetDate();

		if (date.getFullYear() == getUserSettings_("FinancialYear")) {
			monthly_TreatLayout_(date.getFullYear(), date.getMonth());
		}
	} catch (err) {
		console.error("update0pack08_()", err);
		return true;
	}
}


/**
 * Fix number format in Summary for SPARKLINE.
 *
 * 0.18.5
 */
function update0pack07_() {
	try {
		var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Summary");

		sheet.getRange(22, 11).setFormula("ROUND(D9; 0)");
		sheet.getRange(22, 12).setFormula("ROUND(F9; 0)");
		sheet.getRange(22, 11, 1, 2).setNumberFormat("#,##0;(#,##0)");
	} catch (err) {
		console.error("update0pack07_()", err);
		return true;
	}
}


/**
 * Add column Analytics to Tags.
 *
 * 0.18.4
 */
function update0pack06_() {
	try {
		var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Tags");
		var n = sheet.getMaxRows();

		sheet.insertColumnAfter(3);
		sheet.setColumnWidth(4, 83);
		sheet.getRange(1, 4).setValue("Analyitcs");

		if (n <= 1) return;

		sheet.getRange(2, 4, n - 1).setNumberFormat("0.###");

		if (n > 2) {
			sheet.getRange(2, 4, sheet.getMaxRows() - 2).setValue("TRUE");
		}
	} catch (err) {
		console.error("update0pack06_()", err);
		return true;
	}
}


/**
 * Call monthly_TreatLayout_().
 *
 * 0.18.2
 */
function update0pack05_() {
	try {
		var date = getSpreadsheetDate();

		if (date.getFullYear() == getUserSettings_("FinancialYear")) {
			monthly_TreatLayout_(date.getFullYear(), date.getMonth());
		}
	} catch (err) {
		console.error("update0pack05_()", err);
		return true;
	}
}


/**
 * Show sheet "Cards".
 *
 * 0.18.1
 */
function update0pack04_() {
	try {
		var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Cards");

		if (!sheet) {
			return true;
		}

		if (sheet.isSheetHidden()) {
			sheet.showSheet()
		}
	} catch (err) {
		console.error("update0pack04_()", err);
		return true;
	}
}


/**
 * Insert tables for 10 cards.
 * Update functions for cards.
 *
 * 0.18.0
 */
function update0pack03_() {
	try {
		var sheetBackstage = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("_Backstage"),
				sheetCards = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Cards");
		var range, formula, header1, header2, r1c1;
		var db_cards = getPropertiesService_("document", "obj", "DB_CARD");
		var number_accounts = getUserConstSettings_('number_accounts');
		var c1, c2, c3, n, i, k;
		var h_, w_;

		h_ = AppsScriptGlobal.TableDimensions()["height"];
		w_ = AppsScriptGlobal.TableDimensions()["width"];

		n = 10 - db_cards.length;
		if (n > 0) {
			c1 = sheetBackstage.getMaxColumns();
			sheetBackstage.insertColumnsAfter(c1, w_*n);
			sheetBackstage.getRange(1, c1 - 4, sheetBackstage.getMaxRows(), 5)
				.copyTo(
					sheetBackstage.getRange(1, c1 + 1, sheetBackstage.getMaxRows(), w_*n),
					{formatOnly:true}
				);
			SpreadsheetApp.flush();
		}

		c1 = 1 + w_ + w_*number_accounts;
		c2 = c1 + 1;
		c3 = c2 + w_;

		header1 = rollA1Notation(1, c2, 1, w_*11);
		r1c1 = "RC[" + w_ + "]";
		header2 = [ rollA1Notation(1, c3) ];
		for (k = 2; k <= 10; k++) {
			r1c1 += " + RC[" + w_*k + "]";
			header2[k - 1] = rollA1Notation(1, c3 + w_*(k - 1));
		}

		for (i = 0; i < 12; i++) {
			sheetCards.getRange(2, 1 + 6*i).setValue("All");

			formula = "BSINFCARD(IF(" + rollA1Notation(2, 1 + 6*i) + " = \"\"; \"\"; ";
			formula += "OFFSET(INDIRECT(ADDRESS(2; ";
			formula += c1 + " + MATCH(" + rollA1Notation(2, 1 + 6*i) + "; ";
			formula += "\'_Backstage\'!" + header1 + "; 0); 4; true; \"_Backstage\")); ";
			formula += (h_*i) + "; 0; " + h_ + "; 1)))";
			sheetCards.getRange(2, 4 + i*6).setFormula(formula);

			for (k = 0; k < 10; k++) {
				formula = "IFERROR(IF(" + header2[k] + " = \"\"; \"\"; SUM(FILTER(";
				formula += "\'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + "; ";
				formula += "\'Cards\'!" + rollA1Notation(6, 3 + 6*i, -1) + " = " + header2[k] + "; ";
				formula += "NOT(ISBLANK(\'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + ")); ";
				formula += "\'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + " >= 0";
				formula += "))); 0)"
				sheetBackstage.getRange(3 + h_*i, c3 + w_*k).setFormula(formula);

				formula = "IFERROR(IF(" + header2[k] + " = \"\"; \"\"; SUM(FILTER(";
				formula += "\'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + "; ";
				formula += "\'Cards\'!" + rollA1Notation(6, 3 + 6*i, -1) + " = " + header2[k] + "; ";
				formula += "NOT(ISBLANK(\'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + ")); ";
				formula += "\'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + " < 0; ";
				formula += "NOT(REGEXMATCH(\'Cards\'!" + rollA1Notation(6, 5 + 6*i, -1) + "; ";
				formula += "\"#ign\"))";
				formula += "))); 0)"
				sheetBackstage.getRange(4 + h_*i, c3 + w_*k).setFormula(formula);

				formula = "IFERROR(IF(" + header2[k] + " = \"\"; \"\"; SUM(FILTER(";
				formula += "\'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + "; ";
				formula += "\'Cards\'!" + rollA1Notation(6, 3 + 6*i, -1) + " = " + header2[k] + "; ";
				formula += "NOT(ISBLANK(\'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + ")); ";
				formula += "\'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + " < 0";
				formula += "))); 0)"
				sheetBackstage.getRange(5 + h_*i, c3 + w_*k).setFormula(formula);

				sheetBackstage.getRange(6 + h_*i, c3 + w_*k).setFormulaR1C1("R[-1]C + R[-3]C");
			}

			sheetBackstage.getRange(3 + h_*i, c2, 4, 1).setFormulaR1C1(r1c1);
		}

		SpreadsheetApp.flush();
		optCard_Refresh_();
	} catch (err) {
		console.error("update0pack03_()", err);
		return true;
	}
}
