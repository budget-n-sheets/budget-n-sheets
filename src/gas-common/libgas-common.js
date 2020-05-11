/**
 * Copyright (c) 2019 Guilherme T Maeoka
 * This code is licensed under MIT license.
 * <https://github.com/guimspace/gas-common>
 */

function htmlInclude(fileName) {
	return HtmlService.createHtmlOutputFromFile(fileName).getContent();
}


/**
 * Sends an email requesting re-authorization of the script.
 * The property "authorization_status" ensures the recipient receives the email
 * only once (for every new re-authorization needed), otherwise the function
 * would send an email in every call.
 *
 * @return {Boolean} True if re-authorization is required.
 */
function isReAuthorizationRequired_() {
	try {
		var documentProperties = PropertiesService.getDocumentProperties();
	} catch (err) {
		Logger.log(err.message);
		return true;
	}

	var authInfoLevel = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
	var htmlTemplate, htmlMessage;

	if (authInfoLevel.getAuthorizationStatus() == ScriptApp.AuthorizationStatus.NOT_REQUIRED) {
		documentProperties.deleteProperty("auth_request_sent");
		return false;
	}

	if (!documentProperties.getProperty("auth_request_sent") && MailApp.getRemainingDailyQuota() > 0) {
		var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
		htmlTemplate = HtmlService.createTemplateFromFile("gas-common/htmlAuthorizationEmail");

		htmlTemplate.spreadsheet_url = spreadsheet.getUrl();
		htmlTemplate.spreadsheet_name = spreadsheet.getName();
		htmlTemplate.auth_url = authInfoLevel.getAuthorizationUrl();

		htmlMessage = htmlTemplate.evaluate();
		MailApp.sendEmail(
			Session.getEffectiveUser().getEmail(),
			"Authorization Required",
			htmlMessage.getContent(), {
				name: "Add-on Budget n Sheets",
				htmlBody: htmlMessage.getContent(),
				noReply: true
			});

		documentProperties.setProperty("auth_request_sent", "[ ]");
	}

	return true;
}


function randomString(n, p) {
	var a, b;
	var i;

	a = "";
	switch (p) {
		case "digit":
			b = "0123456789";
			break;
		case "lower":
			b = "abcdefghijklmnopqrstuvwxyz";
			break;
		case "upper":
			b = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
			break;
		case "alpha":
			b = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
			break;
		case "lonum":
			b = "abcdefghijklmnopqrstuvwxyz0123456789";
			break;
		case "upnum":
			b = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
			break;
		case "alnum":
			b = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			break;
		case "word":
			b = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";
			break;

		default:
			b = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			break;
	}

	for (i = 0; i < n; i++) {
		a += b.charAt(Math.floor(Math.random() * b.length));
	}

	return a;
}


function rollA1Notation(posRow, posCol, height, width, mode1, mode2) {
	if (!posRow || !posCol) return;
	if (!height) height = 1;
	if (!width) width = 1;
	if (!mode1) mode1 = 1;
	if (!mode2) mode2 = 1;

	posCol--;
	width--;
	mode1--;
	mode2--;

	var str, c, m;

	const f_ = 26;
	const s_ = 4;

	m = mode1%s_;
	str = ((m === 1 || m === 3) ? "$" : "");

	c = (posCol - posCol%f_)/f_;
	str += (c ? String.fromCharCode(64 + c) : "");
	str += String.fromCharCode(65 + posCol%f_);

	str += (m >= 2 ? "$" : "");
	str += posRow;


	if (height === 1 && width === 0) return str;
	else {
		str += ":";
		posCol += width;

		m = mode2%s_;
		str += ((m === 1 || m === 3) ? "$" : "");

		c = (posCol - posCol%f_)/f_;
		str += (c ? String.fromCharCode(64 + c) : "") ;
		str += String.fromCharCode(65 + posCol%f_);

		if (height !== -1) {
			str += (m >= 2 ? "$" : "");
			str += posRow + height - 1;
		}
	}

	return str;
}
