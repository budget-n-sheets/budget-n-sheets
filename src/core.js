/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current spreadsheet.
 */

/**
 * Runs when the add-on is installed; calls onOpen() to ensure menu creation and
 * any other initializion work is done immediately.
 *
 * @param {Object} e The event parameter for a simple onInstall trigger.
 */
function onInstall(e) {
	onOpen(e);

	console.info("add-on/purchase");
}

/**
	* Adds a custom menu with items to show the sidebar and dialog.
	*
	* @param {Object} e The event parameter for a simple onOpen trigger.
	*/
function onOpen(e) {
	try { trial_onOpen(); } catch (err) { }

	var ui = SpreadsheetApp.getUi();
	var menu = ui.createAddonMenu();

	if (e && e.authMode == ScriptApp.AuthMode.NONE) {
		menu.addItem('Start budget sheet', 'showSetupAddon_')
			.addSeparator()
			.addItem('About the add-on', 'showDialogAboutAddon');
	} else {
		if (PropertiesService.getDocumentProperties().getProperty('is_installed')) {
			menu.addItem('Add blank lines', 'toolAddBlankRows')
				.addItem('Sort registry', 'toolFormatRegistry')
				.addItem('Update cash flow', 'toolUpdateCashFlow')
				.addSubMenu(ui.createMenu("Pages view")
					.addItem("Collapse", "toolHideSheets_")
					.addItem("Expand", "toolShowSheets_"))
				.addSeparator()
				.addItem('Open Accounts & Cards panel', 'showPanelTables')
				.addItem('Open Cool Gallery panel', 'showPanelAnalytics')
				.addSeparator()
				.addItem('About the add-on', 'showDialogAboutAddon')
				.addItem('Edit settings', 'showSidebarMainSettings');

			console.info("add-on/open");
		} else {
			menu.addItem('Start budget sheet', 'showSetupAddon_')
				.addSeparator()
				.addItem('About the add-on', 'showDialogAboutAddon');
		}
	}

	menu.addToUi();
}


function showPanelTables(tab) {
	if (onlineUpdate_()) return;

	var htmlTemplate = HtmlService.createTemplateFromFile("html/htmlSidebarTables");

	const dec_p = getSpreadsheetSettings_("decimal_separator");

	if (dec_p) {
		htmlTemplate.dec_p = ".";
		htmlTemplate.dec_ps = ",";
	} else {
		htmlTemplate.dec_p = ",";
		htmlTemplate.dec_ps = ".";
	}

	if (tab) {
		htmlTemplate.tab_acc = "";
		htmlTemplate.tab_cards = "active";
	} else {
		htmlTemplate.tab_acc = "active";
		htmlTemplate.tab_cards = "";
	}

	var htmlSidebar = htmlTemplate.evaluate().setTitle("Accounts & Cards");
	SpreadsheetApp.getUi().showSidebar(htmlSidebar);
}


function showPanelAnalytics() {
	if (onlineUpdate_()) return;

	var htmlTemplate = HtmlService.createTemplateFromFile("html/htmlCoolGallery");
	var htmlSidebar;

	htmlTemplate.list = APPS_SCRIPT_GLOBAL.cool_gallery;

	htmlSidebar = htmlTemplate.evaluate().setTitle("Cool Gallery");

	SpreadsheetApp.getUi().showSidebar(htmlSidebar);
}


function showSidebarMainSettings() {
	if (onlineUpdate_()) return;

	var htmlTemplate = HtmlService.createTemplateFromFile("html/htmlUserSettings");
	var htmlSidebar;
	var calendars = getAllOwnedCalendars();

	CacheService2.put("document", "DB_CALENDARS", "json", calendars);

	htmlTemplate.doc_name = SpreadsheetApp.getActiveSpreadsheet().getName();
	htmlTemplate.financial_year = getConstProperties_("financial_year");
	htmlTemplate.calendars_data = calendars;
	htmlTemplate.calendars_enabled = calendars.md5.length > 0;

	htmlSidebar = htmlTemplate.evaluate().setTitle('Edit settings');

	SpreadsheetApp.getUi().showSidebar(htmlSidebar);
}


function showDialogAboutAddon() {
	try {
		if (PropertiesService.getDocumentProperties().getProperty("is_installed")) {
			onlineUpdate_();
		}
	} catch (err) {
		consoleLog_('error', 'showDialogAboutAddon()', err);
	}

	var htmlDialog, htmlTemplate;
	var v0;

	htmlTemplate = HtmlService.createTemplateFromFile("html/htmlAboutAddon")

	v0 = APPS_SCRIPT_GLOBAL.script_version;
	htmlTemplate.version = v0.major + "." + v0.minor + "." + v0.patch;

	htmlDialog = htmlTemplate.evaluate()
		.setWidth(281)
		.setHeight(359);
	SpreadsheetApp.getUi()
		.showModalDialog(htmlDialog, 'About the add-on');
}


function showDialogErrorMessage(err) {
	if (err) consoleLog_('error', 'showDialogErrorMessage()', err);

	var htmlDialog = HtmlService.createHtmlOutputFromFile("html/htmlExceptionMessage")
		.setWidth(373)
		.setHeight(113);

	SpreadsheetApp.getUi().showModalDialog(htmlDialog, "Something went wrong");
}


function showDialogUpdate() {
	var htmlDialog = HtmlService.createHtmlOutputFromFile("html/htmlUpdateScreen")
		.setWidth(263)
		.setHeight(113);

	SpreadsheetApp.getUi().showModalDialog(htmlDialog, "Add-on update");
}


function showSetupAddon_() {
	console.info("add-on/intent");
	var Ui = SpreadsheetApp.getUi();

	try {
		SpreadsheetApp.openById(APPS_SCRIPT_GLOBAL.template_id);
	} catch (err) {
		consoleLog_('warn', 'showSetupAddon_()', err);

		Ui.alert(
			"Budget n Sheets",
			"The add-on is updating. Try again later.",
			Ui.ButtonSet.OK);

		return;
	}

	if (PropertiesService.getDocumentProperties().getProperty("lock_spreadsheet")) {
		Ui.alert(
			"Can't create budget sheet",
			"The add-on was previously deactivated in this spreadsheet which is now locked.\nPlease start in a new spreadsheet.",
			Ui.ButtonSet.OK);
		return;

	} else if (PropertiesService.getDocumentProperties().getProperty("is_installed")) {
		showDialogSetupEnd();
		onOpen();
		return;

	} else if (SpreadsheetApp.getActiveSpreadsheet().getFormUrl() != null) {
		Ui.alert(
			"Linked form",
			"The spreadsheet has a linked form. Please unlink the form first, or create a new spreadsheet.",
			Ui.ButtonSet.OK);
		return;
	}

	reviseUser_();
	if (setupUi()) return;

	var htmlDialog = HtmlService.createTemplateFromFile("html/htmlSetupAddon")
		.evaluate()
		.setWidth(353)
		.setHeight(359);
	SpreadsheetApp.getUi()
		.showModalDialog(htmlDialog, 'Start budget spreadsheet');
}


function showDialogSetupEnd() {
	var htmlDialog = HtmlService.createTemplateFromFile("html/htmlSetupEnd")
		.evaluate()
		.setWidth(353)
		.setHeight(359);

	SpreadsheetApp.getUi()
		.showModalDialog(htmlDialog, "Add-on Budget n Sheets");
}


function showDialogEditAccount(acc_id) {
	var htmlTemplate = HtmlService.createTemplateFromFile("html/htmlEditAccount");
	var account;

	account = tablesService("get", "account", acc_id);
	if (!account) return 1;

	for (var key in account) {
		htmlTemplate["acc_" + key] = account[key];
	}

	var htmlDialog = htmlTemplate.evaluate()
		.setWidth(300)
		.setHeight(359);

	SpreadsheetApp.getUi().showModalDialog(htmlDialog, "Edit Account");
}


function showDialogAddCard() {
	var htmlTemplate = HtmlService.createTemplateFromFile("html/htmlAddEditCard");
	var card;

	htmlTemplate.is_edit = false;

	card = { id: "", name: "", code: "", aliases: "", limit: 0 };

	for (var key in card) {
		htmlTemplate["card_" + key] = card[key];
	}

	var htmlDialog = htmlTemplate.evaluate()
		.setWidth(300)
		.setHeight(359);

	SpreadsheetApp.getUi().showModalDialog(htmlDialog, "Add Card");
}


function showDialogEditCard(card_id) {
	var htmlTemplate = HtmlService.createTemplateFromFile("html/htmlAddEditCard");
	var card;

	htmlTemplate.is_edit = true;

	card = tablesService("get", "card", card_id);
	if (!card) return 1;

	card.aliases = card.aliases.join(", ");

	for (var key in card) {
		htmlTemplate["card_" + key] = card[key];
	}

	var htmlDialog = htmlTemplate.evaluate()
		.setWidth(300)
		.setHeight(359);

	SpreadsheetApp.getUi().showModalDialog(htmlDialog, "Edit Card");
}


function showDialogDeleteCard(card_id) {
	var card = tablesService("get", "card", card_id);
	if (!card) return 1;

	var ui = SpreadsheetApp.getUi();
	var response = ui.alert(
		"Delete card",
		"Are you sure you want to delete " + card.name + "?",
		ui.ButtonSet.YES_NO);

	if (response == ui.Button.YES) {
		tablesService("set", "deletecard", card_id);
		return 1;
	}
}
