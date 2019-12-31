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
	if (v0.major == v1.major) {
		if (v0.minor > v1.minor) return;
		else if (v0.minor == v1.minor && v0.patch >= v1.patch) return;
	}
	showDialogQuickMessage("Add-on Update", "The add-on is updating...", false, true);

	var b = update_ExecutePatial_();
	if (b === -1) {
		ui.alert(
			"Add-on Update",
			"Update is complete.",
			ui.ButtonSet.OK);
		return;
	} else if (b === 0) {
		ui.alert("Budget n Sheets",
			"The add-on is busy. Try again in a moment.",
			ui.ButtonSet.OK);
	} else if (b === 1) {
		showDialogErrorMessage();
	} else {
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

	var v0 = optGetClass_('script'),
			v1 = AppsScriptGlobal.script_version()["number"];

	if (v0.major > v1.major) return;
	if (v0.major == v1.major) {
		if (v0.minor > v1.minor) return;
		else if (v0.minor == v1.minor && v0.patch >= v1.patch) return;
	}

	var b = update_ExecutePatial_();
	if (b === -1) return;
	if (b > 1) uninstall_();

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
				r.e = 1;
				break;
		}

		if (r.e === -1 && a < v1.minor) {
			v0.minor = a;
			v0.patch = r.p;

			a++;
			p = 0;
		} else {
			t = false;
		}
	}

	if (r.e === -1) {
		v0.minor = a;
		v0.patch = r.p;
		r = -1;
	} else {
		r = 1;
	}

	optSetClass_('script', v0);
	nodeControl_('sign');

	console.info("add-on/update");
	return r;
}


function update_v0m21_(p) {
	switch (p) {
		case 0:
			p = 0;
			break;

		default:
			console.warn("update_v0m21_(): Switch case is default.", p);
			return {e:1, p:p};
	}

	return {e:-1, p:p};
}


function update_v0m20_(p) {
	switch (p) {
		case 0:
			update_v0m20p0s0_();
			p = 0;
		case 1:
			p = 1;
		case 2:
			update_v0m20p1s0_();
			p = 2;
			break;

		default:
			console.warn("update_v0m20_(): Switch case is default.", p);
			return {e:1, p:p};
	}

	return {e:-1, p:p};
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
