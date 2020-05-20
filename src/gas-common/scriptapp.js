/**
 * Copyright (c) 2020 Guilherme T Maeoka
 * This code is licensed under MIT license.
 * <https://github.com/guimspace/gas-common>
 */

function isReAuthorizationRequired_(sendEmail) {
	var authInfoLevel = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
	var requestSent, lock;

	if (authInfoLevel.getAuthorizationStatus() == ScriptApp.AuthorizationStatus.NOT_REQUIRED) {
		PropertiesService.getDocumentProperties().deleteProperty("auth_request_sent");
		return false;
	}

	if (sendEmail) {
		lock = LockService.getUserLock();
		try {
			lock.waitLock(200);
			Utilities.sleep(200);
			sendReAuthorizationRequest_(authInfoLevel);
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
	if (PropertiesService.getDocumentProperties().getProperty("auth_request_sent")) return;
	if (MailApp.getRemainingDailyQuota() == 0) return;

	var htmlTemplate = HtmlService.createTemplateFromFile("gas-common/htmlAuthorizationEmail");
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

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

	PropertiesService.getDocumentProperties().setProperty("auth_request_sent", "true");
}
