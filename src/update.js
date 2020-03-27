var PATCH_THIS_ = Object.freeze({
	patch_list: [
		[
			null, [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ],
			[ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ],
			[ update_v0m20p0_, null, update_v0m20p2_, null, null, null, update_v0m20p6_ ],
			[ null, null, update_v0m21p2_, update_v0m21p3_, null, null ],
			[ update_v0m22p0_, update_v0m22p1_, update_v0m22p2_ ],
			[ null, null ],
			[ null, null, null, update_v0m24p3_, null, null ],
			[ update_v0m25p0_, null, update_v0m25p2_ ],
			[ null ]
		]
	],
	beta_list: [ null, update_v0m26p0b1_ ]
});


function onlineUpdate_() {
	var ui = SpreadsheetApp.getUi();
	try {
		SpreadsheetApp.openById(APPS_SCRIPT_GLOBAL_.template_id);
	} catch (err) {
		consoleLog_('warn', 'onlineUpdate_()', err);

		ui.alert(
			"Add-on Update",
			"Please re-open the spreadsheet to update the add-on.",
			ui.ButtonSet.OK);
		return true;
	}

	var r = update_();

	if (r === 0) {
		return;
	} else if (r === 1) {
		ui.alert("Budget n Sheets",
			"The add-on is busy. Try again in a moment.",
			ui.ButtonSet.OK);
	} else if (r > 1) {
		uninstall_();
		onOpen();
		showDialogErrorMessage();
	}

	return true;
}


function seamlessUpdate_() {
	try {
		SpreadsheetApp.openById(APPS_SCRIPT_GLOBAL_.template_id);
	} catch (err) {
		consoleLog_('warn', 'seamlessUpdate_()', err);
		return true;
	}

	var r = update_();

	if (r === 0) return;
	if (r > 1) uninstall_();

	return true;
}


function optGetClass_(o) {
	var c = getPropertiesService_('document', 'json', 'class_version2');

	return c[o];
}


function optSetClass_(o, v) {
	if (o !== 'script' && o !== 'template') {
		consoleLog_('error', 'optSetClass_(): Switch case is default', {o:o, v:v});
		return;
	}

	var c = getPropertiesService_('document', 'json', 'class_version2');

	c[o] = v;

	setPropertiesService_('document', 'json', 'class_version2', c);
}


/**
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 *
 * 0.0.0
 *
function update_v0m0p0_() {
	try {
	} catch (err) {
		consoleLog_('error', 'update_v0m0p0_()', err);
		return 1;
	}
}*/

/**
 * Set formulas and header for card limit.
 *
 * 0.26.0-beta
 */
function update_v0m26p0b1_() {
	try {
		update_v0m26p0b1s0_();
		update_v0m26p0b1s1_();
	} catch (err) {
		consoleLog_('error', 'update_v0m26p0b1_()', err);
	}
}

/**
 * Set formulas for card limit.
 */
function update_v0m26p0b1s0_() {
	try {
		var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("_Backstage");
		var ranges, col, i, j;

		if (!sheet) return;

		const h_ = TABLE_DIMENSION_.height;
		const w_ = TABLE_DIMENSION_.width;

		const num_acc = getUserConstSettings_('number_accounts');

		ranges = [ ];
		col = 3 + w_ + w_*num_acc + w_;

		if (col + 10*w_ - 2 > sheet.getMaxColumns()) return;

		for (i = 0; i < 12; i++) {
			for (j = 0; j < 10; j++) {
				ranges[10*i + j] = rollA1Notation(6 + h_*i, col + w_*j);
			}
		}

		sheet.getRangeList(ranges).setFormulaR1C1("R[-1]C + R[-4]C + RC[-1]");
	} catch (err) {
		consoleLog_('error', 'update_v0m26p0b1s0_()', err);
	}
}

/**
 * Set header for card limit.
 */
function update_v0m26p0b1s1_() {
	try {
		var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Cards");
		var col, i;

		if (!sheet) return;
		if (sheet.getMaxColumns() < 12*6) return;

		const h_ = TABLE_DIMENSION_.height;
		const w_ = TABLE_DIMENSION_.width;

		const num_acc = getUserConstSettings_('number_accounts');

		col = 1 + w_ + w_*num_acc;

		for (i = 0; i < 12; i++) {
			sheet.getRange(3, 1 + 6*i).setFormula("CONCATENATE(\"AVAIL credit: \"; IF(" + rollA1Notation(2, 2 + 6*i) + " = \"All\"; \"\"; TEXT(OFFSET(INDIRECT(ADDRESS(2 + " + (h_*i) + "; " +  col + " + " + rollA1Notation(2, 1 + 6*i) + "*5 + 1; 4; true; \"_Backstage\")); 4; 1; 1; 1); \"#,##0.00;(#,##0.00)\")))");

			sheet.getRange(4, 1 + 6*i).setFormula("IF(" + rollA1Notation(2, 2 + 6*i) + " = \"All\"; \"\"; SPARKLINE(OFFSET(INDIRECT(ADDRESS(2 + " + (h_*i) + "; " +  col + " + " + rollA1Notation(2, 1 + 6*i) + "*5 + 1; 4; true; \"_Backstage\")); 4; 1; 1; 1), {\"charttype\", \"bar\"; \"max\", OFFSET(INDIRECT(ADDRESS(2 + " + (h_*i) + "; " +  col + " + " + rollA1Notation(2, 1 + 6*i) + "*5 + 1; 4; true; \"_Backstage\")); 0; 1; 1; 1); \"color1\", \"#45818e\"}))");
		}
	} catch (err) {
		consoleLog_('error', 'update_v0m26p0b1s1_()', err);
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

		const number_accounts = getUserConstSettings_('number_accounts');

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

		update_v0m22p1s2_();
		Utilities.sleep(200);
	} catch (err) {
		consoleLog_('error', 'update_v0m22p1_()', err);
	}
}

/**
 * Reinstall triggers if transition year service failed.
 *
 */
function update_v0m22p1s2_() {
	try {
		askReinstall();
	} catch (err) {
		consoleLog_('error', 'update_v0m22p1s2_()', err);
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

/**
 * Transition to new update system.
 *
 * 0.20.6
 */
function update_v0m20p6_() {
	try {
		var a = {
			script: APPS_SCRIPT_GLOBAL_.script_version.number,
			template: APPS_SCRIPT_GLOBAL_.template_version.number
		};

		setPropertiesService_('document', 'json', 'class_version2', a);
	} catch (err) {
		consoleLog_('error', 'update_v0m20p6_()', err);
		return 1;
	}
}

/**
 * Reinstall weekly_Bar_() trigger to fix week day.
 *
 * 0.20.2
 */
function update_v0m20p2_() {
	try {
		var financial_year;
		var date, day;

		if (getPropertiesService_('document', 'string', 'OperationMode') === 'active') return;

		financial_year = getUserConstSettings_('financial_year');
		date = getSpreadsheetDate();

		if (date.getFullYear() < financial_year || financial_year >= 2020) {
			day = new Date(financial_year, 0, 2);
			day = day.getDay();

			deleteScriptAppTriggers_('document', 'weeklyMainId');
			createScriptAppTriggers_('document', 'weeklyMainId', 'onWeekDay', 'weekly_Bar_', day);
		}
	} catch (err) {
		consoleLog_('error', 'update_v0m20p2_()', err);
		return 1;
	}
}


/**
 * Import cool sheet Stats for Tags.
 *
 * 0.20.0
 */
function update_v0m20p0_() {
	try {
		if (!SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Stats for Tags')) {
			coolGallery('tags');
		}
	} catch (err) {
		consoleLog_('error', 'update_v0m20p0_()', err);
		return 1;
	}
}
