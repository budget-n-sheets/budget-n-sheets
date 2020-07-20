function setUserId_() {
	var userId = Session.getEffectiveUser().getEmail();
	if (!userId) throw new Error("User's identity is null.");

	userId = computeDigest("SHA_256", userId, "UTF_8");
	PropertiesService2.setProperty("user", "user_id", "string", userId);

	return userId;
}

function getUserId_() {
	var userId = CacheService2.get("user", "user_id", "string");

	if (userId == null) {
		userId = PropertiesService2.getProperty("user", "user_id", "string");
		if (!userId) userId = setUserId_();
		CacheService2.put("user", "user_id", "string", userId);
	}

	return userId;
}

function setAdminSettings(key, value) {
	return classAdminSettings_("set", key, value);
}

function classAdminSettings_(select, key, value) {
	var lock = LockService.getDocumentLock();
	try {
		lock.waitLock(1000);
	} catch (err) {
		ConsoleLog.warn(err);
		return 1;
	}

	var admin_settings = CacheService2.get("document", "admin_settings", "json");
	if (!admin_settings) {
		admin_settings = PropertiesService2.getProperty("document", "admin_settings", "json");
		CacheService2.put("document", "admin_settings", "json", admin_settings);
	}

	if (select === "get") {
		switch (key) {
		case "admin_id":
		case "isChangeableByEditors":
			return admin_settings[key];

		default:
			ConsoleLog.error("classAdminSettings_(): Switch case is default", { key: key });
			return 1;
		}

	} else if (select === "set") {
		if (getUserId_() !== admin_settings.admin_id) return 1;

		switch (key) {
		case "admin_id":
		case "isChangeableByEditors":
			admin_settings[key] = value;
			break;

		default:
			ConsoleLog.error("classAdminSettings_(): Switch case is default", { key: key });
			return 1;
		}

		PropertiesService2.setProperty("document", "admin_settings", "json", admin_settings);
		CacheService2.put("document", "admin_settings", "json", admin_settings);

	} else {
		ConsoleLog.error("classAdminSettings_(): Select case is default", { select: select });
		return 1;
	}
}

function askTransferAdmin() {
	if (! isInstalled_()) return;

	var ui = SpreadsheetApp.getUi();
	var owner, owner_id;

	owner = SpreadsheetApp.getActiveSpreadsheet().getOwner();
	if (owner) {
		owner = owner.getEmail();
		owner_id = computeDigest("SHA_256", owner, "UTF_8");
	}

	if (!owner || getUserId_() === owner_id) {
		ui.alert(
			"Can't transfer admin role",
			"The admin role can only be transferred to the owner of the spreadsheet.\nMake an editor the owner and try again.",
			ui.ButtonSet.OK);
		return 1;
	}

	var response = ui.alert(
			"Transfer the admin role?",
			"You might lose the ability to change settings. You can't undo this action!\n\nNew admin: " + owner,
			ui.ButtonSet.YES_NO);

	if (response == ui.Button.YES) {
		classAdminSettings_("set", "admin_id", owner_id);
		deleteAllTriggers_();
		setUserSettings_("financial_calendar", "");
		setUserSettings_("post_day_events", false);
		setUserSettings_("cash_flow_events", false);
		console.info("admin-role/transferred");
		return;
	}

	return 1;
}

function askTransferAdminSd() {
	if (! isInstalled_()) return;

	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var editors, email, digest;
	var user = Session.getEffectiveUser().getEmail();

	if (spreadsheet.getowner() || getUserId_() !== classAdminSettings_("get", "admin_id")) return 1;

	editors = spreadsheet.getEditors();
	if (editors.length == 1) {
		SpreadsheetApp.getUi().alert(
			"Can't transfer admin role",
			"You are the only editor of the spreadsheet.",
			SpreadsheetApp.getUi().ButtonSet.OK);
		return 1;
	}

	for (var i = 0; i < editors.length; i++) {
		email = editors[i].getEmail();
		if (user === email) continue;

		digest = computeDigest("MD5", email, "UTF_8");
		digest = digest.substring(0, 12);

		editors[i] = {
			digest: digest,
			email: email
		};
	}

	htmlTemplate = HtmlService.createTemplateFromFile("html/htmlSelectEditor");
	htmlTemplate.editors = editors;
	htmlDialog = htmlTemplate.evaluate()
		.setWidth(281)
		.setHeight(233);

	SpreadsheetApp.getUi().showModalDialog(htmlDialog, "Transfer the admin role");
}

function continuedTransferAdminSd(editor) {
	if (! isInstalled_()) return;

	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var editors, email, digest;
	var user = Session.getEffectiveUser().getEmail();

	if (spreadsheet.getowner() || getUserId_() !== classAdminSettings_("get", "admin_id")) return 1;

	editors = spreadsheet.getEditors();
	if (editors.length == 1) {
		SpreadsheetApp.getUi().alert(
			"Can't transfer admin role",
			"You are the only editor of the spreadsheet.",
			SpreadsheetApp.getUi().ButtonSet.OK);
		return 1;
	}

	for (var i = 0; i < editors.length; i++) {
		email = editors[i].getEmail();
		if (user === email) continue;

		digest = computeDigest("MD5", email, "UTF_8");
		digest = digest.substring(0, 12);

		if (digest === editor) {
			digest = computeDigest("SHA_256", email, "UTF_8");
			classAdminSettings_("set", "admin_id", digest);
			deleteAllTriggers_();
			setUserSettings_("financial_calendar", "");
			setUserSettings_("post_day_events", false);
			setUserSettings_("cash_flow_events", false);
			console.info("admin-role/transferred");
			return;
		}
	}
}
