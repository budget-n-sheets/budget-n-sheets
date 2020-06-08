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
		consoleLog_("warn", "classAdminSettings_(): Wait lock time out.", err);
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
			consoleLog_("error", "classAdminSettings_(): Switch case is default", key);
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
			consoleLog_("error", "classAdminSettings_(): Switch case is default", key);
			return 1;
		}

		PropertiesService2.setProperty("document", "admin_settings", "json", admin_settings);
		CacheService2.put("document", "admin_settings", "json", admin_settings);

	} else {
		consoleLog_("error", "classAdminSettings_(): Select case is default", select);
		return 1;
	}
}
