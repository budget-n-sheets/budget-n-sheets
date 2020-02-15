var PatchThis = (function() {
	var o = {
		patch_list: [
			[
				null, [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ],
				[ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ],
				[ update_v0m20p0_, null, update_v0m20p2_, null, null, null, update_v0m20p6_ ],
				[ null, null, update_v0m21p2_, update_v0m21p3_ ]
			]
		]
	};

	return {
		patch_list: function() { return o.patch_list }
	};
})();


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

	const v0 = optGetClass_('script');
	const v1 = AppsScriptGlobal.script_version()["number"];

	if (v0.major > v1.major) return;
	if (v0.major == v1.major) {
		if (v0.minor > v1.minor) return;
		else if (v0.minor == v1.minor && v0.patch >= v1.patch) return;
	}

	showDialogQuickMessage("Add-on Update", "The add-on is updating...", false, true);

	var r = update_();

	if (r === 0) {
		ui.alert(
			"Add-on Update",
			"Update is complete.",
			ui.ButtonSet.OK);
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
		SpreadsheetApp.openById( AppsScriptGlobal.TemplateId() );
	} catch (err) {
		console.warn("seamlessUpdate_()", err);
		return true;
	}

	const v0 = optGetClass_('script');
	const v1 = AppsScriptGlobal.script_version()["number"];

	if (v0.major > v1.major) return;
	if (v0.major == v1.major) {
		if (v0.minor > v1.minor) return;
		else if (v0.minor == v1.minor && v0.patch >= v1.patch) return;
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
			console.error("optSetClass_(): Switch case is default", {o:o, v:v});
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
		console.error("update_v0m0p0_()", err);
		return 1;
	}
}*/

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
		console.error("update_v0m21p3_()", err);
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
		console.error("update_v0m21p2_()", err);
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
			script: AppsScriptGlobal.script_version()["number"],
			template: AppsScriptGlobal.template_version()["number"]
		};

		setPropertiesService_('document', 'json', 'class_version2', a);
	} catch (err) {
		console.error("update_v0m20p6_()", err);
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
		console.error("update_v0m20p2_()", err);
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
		console.error("update_v0m20p0_()", err);
		return 1;
	}
}
