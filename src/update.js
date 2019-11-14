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

	if (version >= AppsScriptGlobal.AddonVersion()) return;

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
		onOpen();
		showDialogErrorMessage();
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

	if (version >= AppsScriptGlobal.AddonVersion()) return;

	var b = update_ExecutePatial_();
	if (b === -1) return;
	if (b === 1) uninstall_();

	return true;
}


var HEAD_EP = 72;
function update_ExecutePatial_() {
	if (!getPropertiesService_('document', '', 'is_installed')) return 1;

	var lock = LockService.getDocumentLock();
	try {
		lock.waitLock(200);
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
		case 67:
			update_v0m19p0_();
			update_v0m19p1_();
		case 68:
			update_v0m19p2_();
		case 69:
			update_v0m19p3_();
		case 70:
			update_v0m19p4_();
			update_v0m19p5_();
		case 71:
			update_v0m19p6_();
			update_v0m19p7_();
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
	nodeControl_("sign");
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
 * Update BSSUMBYTAG() function.
 *
 * 0.19.4
 */
function update_v0m19p7_() {
	try {
		var sheet, formula, formulas, rg, cd;
		var rgMonthTags, rgMonthCombo;
		var i, k;

		sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Tags");
		number_accounts = getUserConstSettings_('number_accounts');

		formulas = [ [ ] ];
		rgMonthTags = [ ];
		rgMonthCombo = [ ];

		for (k = 0; k < 1 + number_accounts; k++) {
			rgMonthTags[k] = rollA1Notation(5, 4 + 5*k, -1, 1);
			rgMonthCombo[k] = rollA1Notation(5, 3 + 5*k, -1, 2);
		}

		for (i = 0; i < 12; i++) {
			rg = "{\'" + MN_SHORT_[i] + "\'!" + rgMonthCombo[0];
			cd = "{\'" + MN_SHORT_[i] + "\'!" + rgMonthTags[0];

			for (k = 1; k < 1 + number_accounts; k++) {
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
	} catch (err) {
		console.error("update_v0m19p7_()", err);
		return true;
	}
}

/**
 * Update custom functions.
 *
 * 0.19.4
 */
function update_v0m19p6_() {
	try {
		var spreadsheet, sheetBackstage, sheetMonth, formula;
		var range_value_tags, range_value, range_tags;
		var number_accounts, header;
		var c, n, i, k;
		var h_, w_;

		h_ = TABLE_DIMENSION_.height;
		w_ = TABLE_DIMENSION_.width;

		spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
		sheetCards = spreadsheet.getSheetByName("Cards");
		sheetBackstage = spreadsheet.getSheetByName("_Backstage");

		number_accounts = getUserConstSettings_('number_accounts');

		c = 1 + w_ + w_*number_accounts;
		header = rollA1Notation(1, c + 1, 1, w_*11);

		for (i = 0; i < 12; i++) {
			sheetMonth = spreadsheet.getSheetByName(MN_SHORT_[i]);
			n = sheetMonth.getMaxRows() - 4;

			for (k = 0; k < number_accounts; k++) {
				formula = 'NOT(ISBLANK(' + MN_SHORT_[i] + '!' + rollA1Notation(5, 9 + 5*k, n, 1, 1) + '))';
				formula = 'FILTER(' + MN_SHORT_[i] + '!' + rollA1Notation(5, 8 + 5*k, n, 2, 1) + '; ' + formula + ')';
				formula = 'IFERROR(' + formula + '; \"\")';
				formula = 'BSREPORT(TRANSPOSE(' + formula + '))';

				sheetBackstage.getRange(2 + h_*i, 8 + w_*k).setFormula(formula);

				formula = "CONCATENATE(";
				formula += "\"Withdrawal: (\"; \'_Backstage\'!" + rollA1Notation(2 + h_*i, 9 + w_*k) + "; \") \"; TEXT(\'_Backstage\'!" + rollA1Notation(2 + h_*i, 8 + w_*k) + "; \"#,##0.00;-#,##0.00\"); \"\n\"; ";
				formula += "\"Deposit: (\"; \'_Backstage\'!" + rollA1Notation(3 + h_*i, 9 + w_*k) + "; \") \"; TEXT(\'_Backstage\'!" + rollA1Notation(3 + h_*i, 8 + w_*k) + "; \"#,##0.00;-#,##0.00\"); \"\n\"; ";
				formula += "\"Trf. in: (\"; \'_Backstage\'!" + rollA1Notation(4 + h_*i, 9 + w_*k) + "; \") \"; TEXT(\'_Backstage\'!" + rollA1Notation(4 + h_*i, 8 + w_*k) + "; \"#,##0.00;-#,##0.00\"); \"\n\"; ";
				formula += "\"Trf. out: (\"; \'_Backstage\'!" + rollA1Notation(5 + h_*i, 9 + w_*k) + "; \") \"; TEXT(\'_Backstage\'!" + rollA1Notation(5 + h_*i, 8 + w_*k) + "; \"#,##0.00;-#,##0.00\")";
				formula += ")";

				sheetMonth.getRange(1, 8 + 5*k).setFormula(formula);
			}

			formula = "MATCH(" + rollA1Notation(2, 1 + 6*i) + "; \'_Backstage\'!" + header + "; 0)";
			formula = "INDIRECT(ADDRESS(2; " +  c + " + " + formula + "; 4; true; \"_Backstage\"))";
			formula = "OFFSET(" + formula + "; " + (h_*i) + "; 0; " + h_ + "; 1)";
			formula = "IF(" + rollA1Notation(2, 1 + 6*i) + " = \"\"; \"\"; " + formula + ")";
			formula = "BSINFCARD(" + formula + ")";

			sheetCards.getRange(2, 4 + i*6).setFormula(formula);
		}
	} catch (err) {
		console.error("update_v0m19p6_()", err);
		return true;
	}
}

/**
 * Add conditional format to Cards.
 *
 * 0.19.3
 */
function update_v0m19p5_() {
	try {
		var sheet, range, rules, rule;
		var n, i;

		sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Cards");
		if (!sheet) return;
		if (sheet.getMaxColumns() < 72) return;

		rules = sheet.getConditionalFormatRules();
		n = sheet.getMaxRows() - 5;
		if (n < 1) return;

		for (i = 0; i < 12; i++) {
			range = sheet.getRange(6, 1 + 6*i, n, 5);
			range.setFontColor('#000000');

			rule = SpreadsheetApp.newConditionalFormatRule()
				.whenFormulaSatisfied("=REGEXMATCH(" + rollA1Notation(6, 5 + 6*i, 1, 1, 2) + "; \"#ign\")")
				.setFontColor("#999999")
				.setRanges([ range ])
				.build();
			rules.push(rule);
		}

		sheet.setConditionalFormatRules(rules);
	} catch (err) {
		console.error("update_v0m19p5_()", err);
		return true;
	}
}

/**
 * Fix test criteria to count tags.
 *
 * 0.19.3
 */
function update_v0m19p4_() {
	try {
		SpreadsheetApp.getActiveSpreadsheet()
			.getSheetByName('_Settings')
			.getRange('B7')
			.setFormula("COUNTIF(\'Tags\'!$E1:$E; \"<>\") - 1");
	} catch (err) {
		console.error("update_v0m19p4_()", err);
		return true;
	}
}

/**
 * Fix formatting in Tags.
 *
 * 0.19.1
 */
function update_v0m19p3_() {
	try {
		var sheet, range, n;

		sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Tags');

		n = sheet.getMaxRows();
		if (n < 3) return;
		n -= 1;

		range = sheet.getRange(2, 1, n - 1, 20);
		sheet.getRange(n + 1, 1, 1, 20).copyTo(range, {formatOnly:true});
		sheet.getRange(2, 4, n, 1).setNumberFormat('0.###');
	} catch (err) {
		console.error("update_v0m19p3_()", err);
		return true;
	}
}

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
		sheet.getRange(2, 4, n, 1).setHorizontalAlignment('center');
		sheet.showColumns(1, 5);
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

		w_ = TABLE_DIMENSION_.width;
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
