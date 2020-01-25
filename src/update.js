var PatchThis = (function() {
	var o = {
		patch_list: [
			[
				null, [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ],
				[ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ],
				[ update_v0m20p0_, null, update_v0m20p2_, null, null, null, update_v0m20p6_ ],
				[ null, null ]
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
 * Set MD5 of selected financial calendar ID.
 * Update calendars DB.
 *
 * 0.21.1
 */
function update_v0m21p1_() {
	try {
		var db_calendars;
		var calendars, calendar;
		var digest, id, a, i, t;

		t = 0;
		calendar = getUserSettings_("FinancialCalendar");

		db_calendars = {
			id: [ ],
			md5: [ ]
		};

		calendars = CalendarApp.getAllOwnedCalendars();

		for (i = 0; i < calendars.length; i++) {
			id = calendars[i].getId();
			digest = computeDigest("MD5", id, "UTF_8");

			db_calendars.id.push(id);
			db_calendars.md5.push(digest);

			if (calendar == "") continue;

			a = computeDigest("SHA_1", id, "UTF_8");
			if (calendar === a) {
				setUserSettings_("FinancialCalendar", digest);
				calendar = "";
				t = 1;
			}
		}

		if (!t) {
			setUserSettings_("FinancialCalendar", "");
			setUserSettings_("PostDayEvents", false);
			setUserSettings_("CashFlowEvents", false);
		}

		setPropertiesService_("document", "json", "DB_CALENDARS", db_calendars);
	} catch (err) {
		console.error("update_v0m21p1_()", err);
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
