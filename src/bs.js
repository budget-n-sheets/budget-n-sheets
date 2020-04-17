function nodeControl_(c, data) {
	switch (c) {
		case "sign":
			return signDoc_();
		case "verify":
			return verifySig_(data);
		case "import":
			return importAboutPage_();

		default:
			console.error("nodeControl_(): Switch case is default.", c);
			return 1;
	}
}


function importAboutPage_() {
	var template, spreadsheet;

	try {
		template = SpreadsheetApp.openById(APPS_SCRIPT_GLOBAL_.template_id);
	} catch (err) {
		consoleLog_("warn", "importAboutPage_()", err);
		return 1;
	}

	spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

	if (spreadsheet.getSheetByName("_About BnS")) return;

	template.getSheetByName("_About BnS")
		.copyTo(spreadsheet)
		.setName("_About BnS")
		.setTabColor("#6aa84f")
		.hideSheet()
		.protect()
		.setWarningOnly(true);
}


function signDoc_() {
	var sheet, sig;

	sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("_About BnS");
	if (!sheet) {
		if (importAboutPage_()) return 1;

		sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("_About BnS");
		if (!sheet) return 1;
	}

	sig = makeSign_();
	if (!sig) return 1;

	sheet.getRange(8, 2).setValue(sig);
	SpreadsheetApp.flush();
}


function makeSign_() {
	const key = PropertiesService.getScriptProperties().getProperty("inner_lock");
	if (!key) {
		console.warn("Key 'inner_lock' was not found!");
		return;
	}

	const const_properties = getPropertiesService_("document", "json", "const_properties");
	if (!const_properties) {
		console.warn("Property 'const_properties' is undefined!");
		return;
	}

	const class_version = getPropertiesService_("document", "json", "class_version2");
	if (!class_version) {
		console.warn("Property 'class_version' is undefined!");
		return;
	}

	var data = {
		spreadsheet_id: SpreadsheetApp.getActiveSpreadsheet().getId(),

		addon_version: class_version.script,
		template_version: class_version.template,

		financial_year: const_properties.financial_year,
		number_accounts: const_properties.number_accounts
	};

	data = JSON.stringify(data);
	data = Utilities.base64EncodeWebSafe(data, Utilities.Charset.UTF_8);

	const sig = computeHmacSignature("SHA_256", data, key, "UTF_8");

	return data + ":" + sig;
}


function verifySig_(data) {
	if (!data || typeof data != "string") {
		consoleLog_("warn", "verifySig_(): type of parameter is incorrect.", {type: typeof data});
		return 1;
	}

	const key = PropertiesService.getScriptProperties().getProperty("inner_lock");
	if (!key) {
		console.warn("Key 'inner_lock' was not found!");
		return 1;
	}

	data = data.split(":");
	if (data.length != 2) return 1;

	const sig = computeHmacSignature("SHA_256", data[0], key, "UTF_8");

	if (sig !== data[1]) return 1;
}
