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

	var r = update_partial_();

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

	var r = update_partial_();

	if (r === 0) return;
	if (r > 1) uninstall_();

	return true;
}


function update_partial_() {
	if (!getPropertiesService_('document', '', 'is_installed')) return 3;

	var lock = LockService.getDocumentLock();
	try {
		lock.waitLock(200);
	} catch (err) {
		console.warn("update_ExecutePatial_(): Wait lock time out.");
		return 1;
	}

	const v0 = optGetClass_('script');
	const v1 = AppsScriptGlobal.script_version()["number"];

	if (v0.major > v1.major) return 0;
	if (v0.major == v1.major) {
		if (v0.minor > v1.minor) return 0;
		else if (v0.minor == v1.minor && v0.patch >= v1.patch) return 0;
	}

	var ver, major, minor, patch;
	var mm, pp, r, t;

	major = v0.major;
	minor = v0.minor;
	patch = v0.patch;
	list = AppsScriptGlobal.patch_list();

	t = 0;
	mm = minor;
	pp = patch;
	r = {r:0, m:minor, p:patch};

	do {
		ver = (major == v1.major ? v1 : null);
		if (major >= list.length) {
			major -= 2;
			t = 1;
		} else if (list[major]) {
			r = update_major_(ver, list[major], minor, patch);
		}

		if (r.r || major == v1.major) {
			t = 1;
		} else {
			major++;
			mm = r.m;
			minor = 0;
			pp = r.p;
			patch = -1;
		}
	} while (!t);

	if (r.r) {
		if (r.m == -1) {
			major--;
			r.m = mm;
		}
		if (r.p == -1) r.p = pp;

		console.info("add-on/update/fail", r);
	} else {
		console.info("add-on/update/success");
	}

	var cell = {
		major: major,
		minor: r.m,
		patch: r.p
	};

	optSetClass_('script', cell);
	nodeControl_('sign');

	return 0;
}


function update_major_(v1, list, minor, patch) {
	var m = minor;
	var p = patch;
	var ver, pp, r, t;

	t = 0;
	pp = p;
	r = {r:0, p:p};

	do {
		if (v1 && m == v1.minor) ver = v1;
		else ver = null;

		if (m >= list.length) {
			m -= 2;
			t = 1;
		} else if (list[m]) {
			r = update_minor_(ver, list[m], p);
		}

		if (r.r || (ver && m == ver.minor)) {
			t = 1;
		} else {
			m++;
			pp = r.p;
			p = -1;
		}
	} while (!t);

	if (r.r && r.p == -1) {
		m--;
		r.p = pp;
	}

	p = r.p;
	r = r.r;

	return {r:r, m:m, p:p};
}


function update_minor_(v1, list, patch) {
	var p = patch;
	var ver, r;

	r = 0;

	if (v1) ver = v1;
	else ver = {patch:-100};

	do {
		p++;
		if (p >= list.length) {
			p--;
			break;
		} else if (list[p]) {
			r = list[p]();
		}
	} while (!r && p != ver.patch);

	if (r) p--;

	return {r:r, p:p};
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
