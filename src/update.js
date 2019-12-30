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

	var v0 = optGetClass_('script'),
			v1 = AppsScriptGlobal.script_version()["number"];

	if (v0.major > v1.major) return;
	if (v0.minor > v1.minor) return;
	if (v0.patch >= v1.patch) return;

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

	var v0 = optGetClass_('script'),
			v1 = AppsScriptGlobal.script_version()["number"];

	if (v0.major > v1.major) return;
	if (v0.minor > v1.minor) return;
	if (v0.patch >= v1.patch) return;

	var b = update_ExecutePatial_();
	if (b === -1) return;
	if (b === 1) uninstall_();

	return true;
}


function update_ExecutePatial_() {
	if (!getPropertiesService_('document', '', 'is_installed')) return 1;

	var lock = LockService.getDocumentLock();
	try {
		lock.waitLock(200);
	} catch (err) {
		console.warn("update_ExecutePatial_(): Wait lock time out.");
		return 0;
	}

	var v0 = optGetClass_('script'),
			v1 = AppsScriptGlobal.script_version()["number"];
	var a, p, r, t;

	r = -1;
	t = true;
	a = v0.minor;
	p = v0.patch;

	while (t) {
		switch (a) {
			case 20:
				r = update_v0m20_(p);
				break;
			case 21:
				r = update_v0m21_(p);
				break;

			default:
				console.warn("update_ExecutePatial_(): Switch case is default.", a);
				r = 0;
				break;
		}

		if (r === -1) {
			if (a < v1.minor) {
				a++;
				p = 0;
			} else {
				t = false;
			}
		} else {
			return 0;
		}
	}

	v0.minor = a;
	v0.patch = p;
	optSetClass_('script', v0);
	nodeControl_('sign');

	console.info("add-on/update");
	return -1;
}


function update_v0m21_(patch) {
	switch (patch) {
		case 0:
			break;

		default:
			console.warn("update_v0m20_(): Switch case is default.", patch);
			return 0;
	}

	return -1;
}


function update_v0m20_(patch) {
	switch (patch) {
		case 0:
			update_v0m20p0s0_();
		case 1:
		case 2:
			update_v0m20p1s0_();
			break;

		default:
			console.warn("update_v0m20_(): Switch case is default.", patch);
			return 0;
	}

	return -1;
}


/**
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 *
 * 0.0.0
 *
function update_v0m0p0s0_() {
	try {
	} catch (err) {
		console.error("update_v0m0p0s0_()", err);
		return true;
	}
}*/


/**
 * Reinstall weekly_Bar_() trigger to fix week day.
 *
 * 0.20.2
 */
function update_v0m20p2s0_() {
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
		console.error("update_v0m20p2s0_()", err);
		return true;
	}
}


/**
 * Import cool sheet Stats for Tags.
 *
 * 0.20.0
 */
function update_v0m20p0s0_() {
	try {
		if (!SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Stats for Tags')) {
			coolGallery('tags');
		}
	} catch (err) {
		console.error("update_v0m20p0s0_()", err);
		return true;
	}
}
