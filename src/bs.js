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
		consoleLog_('warn', 'importAboutPage_()', err);
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
	var sheet, sig;

	sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("About");
	if (!sheet) return 1;

	sig = makeSign_();
	if (!sig) return 2;
	sheet.getRange(8, 2).setValue(sig);

	SpreadsheetApp.flush();
	return -1;
}


function makeSign_() {
	const key = PropertiesService.getScriptProperties().getProperty('inner_lock');
	if (!key) {
		console.warn("Key 'inner_lock' was not found!");
		return;
	}

	const user_const_settings = getPropertiesService_('document', 'json', 'user_const_settings');
	if (!user_const_settings) {
		console.warn("Property 'user_const_settings' is undefined!");
		return;
	}

	const class_version = getPropertiesService_('document', 'json', 'class_version2');
	if (!class_version) {
		console.warn("Property 'class_version' is undefined!");
		return;
	}

	var data, sig;

	data = {
		spreadsheet_id: SpreadsheetApp.getActiveSpreadsheet().getId(),

		addon_version: class_version.script,
		template_version: class_version.template,

		financial_year: user_const_settings.financial_year,
		number_accounts: user_const_settings.number_accounts
	};

	data = JSON.stringify(data);
	data = Utilities.base64EncodeWebSafe(data, Utilities.Charset.UTF_8);

	sig = computeHmacSignature("SHA_256", data, key, "UTF_8");

	return data + ":" + sig;
}


function verifySig_(data) {
	if (typeof data != "string") {
		consoleLog_('warn', 'verifySig_(): type of parameter is incorrect.', {data:data, type:typeof data});
		return 2;
	}

	const key = PropertiesService.getScriptProperties().getProperty('inner_lock');
	if (!key) {
		console.warn("Key 'inner_lock' was not found!");
		return 1;
	}

	var sig;

	data = data.split(":");
	if (data.length != 2) return 2;

	sig = computeHmacSignature("SHA_256", data[0], key, "UTF_8");

	if (sig !== data[1]) return -10;

	return -1;
}
