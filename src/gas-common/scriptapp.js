/**
 * Copyright (c) 2020 Guilherme T Maeoka
 * This code is licensed under MIT license.
 * <https://github.com/guimspace/gas-common>
 */

function isReAuthorizationRequired_(sendEmail) {
	var authInfoLevel = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
	var documentProperties, lock;

	try {
		documentProperties = PropertiesService.getDocumentProperties();
	} catch (e) {
		console.error("isReAuthorizationRequired_(): " + e);
		return true;
	}

	if (authInfoLevel.getAuthorizationStatus() == ScriptApp.AuthorizationStatus.NOT_REQUIRED) {
		documentProperties.deleteProperty("auth_request_sent");
		return false;
	}

	if (sendEmail && documentProperties.getProperty("auth_request_sent") == null) {
		lock = LockService.getUserLock();

		try {
			lock.waitLock(100);

			if (documentProperties.getProperty("auth_request_sent") != null) {
				return;
			}

			sendReAuthorizationRequest_(authInfoLevel);
			documentProperties.setProperty("auth_request_sent", "true");

		} catch (e) {
			console.error("isReAuthorizationRequired_(): " + e);
			return true;

		} finally {
			lock.releaseLock();
		}
	}

	return true;
}


function sendReAuthorizationRequest_(authInfoLevel) {
	if (MailApp.getRemainingDailyQuota() == 0) return;

	var htmlTemplate = HtmlService.createTemplateFromFile("gas-common/htmlAuthorizationEmail");
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

	htmlTemplate = printHrefScriptlets(htmlTemplate);

	htmlTemplate.spreadsheet_url = spreadsheet.getUrl();
	htmlTemplate.spreadsheet_name = spreadsheet.getName();
	htmlTemplate.auth_url = authInfoLevel.getAuthorizationUrl();

	var htmlMessage = htmlTemplate.evaluate();
	MailApp.sendEmail(
		Session.getEffectiveUser().getEmail(),
		"Authorization Required",
		htmlMessage.getContent(), {
			name: "Add-on Budget n Sheets",
			htmlBody: htmlMessage.getContent(),
			noReply: true
		});

	console.log("reauth-request/sent");
}
