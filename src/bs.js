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
		template = SpreadsheetApp.openById(AppsScriptGlobal.TemplateId());
	} catch (err) {
		console.warn("importAboutPage_()", err);
		return 1;
	}

	spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

	if (spreadsheet.getSheetByName("About")) return -1;

	template.getSheetByName("About")
		.copyTo(spreadsheet)
		.setName("About")
		.setTabColor('#6aa84f')
		.hideSheet()
		.protect()
		.setWarningOnly(true);

	return -1;
}


function signDoc_() {
	var spreadsheet, sheet;
	var key, data, sig;
	var c;

	key = PropertiesService.getScriptProperties().getProperty("inner_lock");

	if (!key) {
		console.warn("Key 'inner_lock' was not found!");
		return 1;
	}

	spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	sheet = spreadsheet.getSheetByName("About");

	if (!sheet) return 1;

	data = {
		spreadsheet_id: spreadsheet.getId(),

		addon_version: optGetClass_("AddonVersion"),
		template_version: optGetClass_("TemplateVersion"),

		financial_year: getUserConstSettings_('financial_year'),
		number_accounts: getUserConstSettings_('number_accounts')
	};

	data = JSON.stringify(data);
	data = Utilities.base64EncodeWebSafe(data, Utilities.Charset.UTF_8);
	sig = computeHmacSignature("SHA_256", data, key, "UTF_8");

	sheet.getRange(8, 2).setValue(data + ":" + sig);

	SpreadsheetApp.flush();
	return -1;
}


function verifySig_(data) {
	if (typeof data != "string") {
		console.warn("verifySig_(): type of parameter is incorrect.", {data:data, type:typeof data});
		return 2;
	}

	var key, sig;

	key = PropertiesService.getScriptProperties().getProperty("inner_lock");

	if (!key) {
		console.warn("Key 'inner_lock' was not found!");
		return 1;
	}

	data = data.split(":");
	if (data.length !== 2) return 2;

	sig = computeHmacSignature("SHA_256", data[0], key, "UTF_8");

	if (sig !== data[1]) return -10;

	return -1;
}
