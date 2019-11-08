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


var HEAD_EP = 70;
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
		case 64:
		case 65:
		case 66:
			c = update0pack13_();
			if (c) break;

		case 67:
			update_v0m19p0_();
			update_v0m19p1_();

		case 68:
			update_v0m19p2_();

		case 69:
			update_v0m19p3_();
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
		var user_settings, user_const_settings;

		user_settings = getPropertiesService_('document', 'json', 'user_settings');

		user_const_settings = {
			date_created: 0,
			number_accounts: getPropertiesService_('document', 'number', 'number_accounts'),
			financial_year: user_settings.FinancialYear
		};

		setPropertiesService_('document', 'obj', 'user_const_settings', user_const_settings);
	} catch (err) {
		console.error("update0pack13_()", err);
		return true;
	}
}
