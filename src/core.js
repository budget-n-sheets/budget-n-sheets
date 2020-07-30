/** @NotOnlyCurrentDoc */

/**
 * Runs when the add-on is installed; calls onOpen() to ensure menu creation and
 * any other initializion work is done immediately.
 *
 * @param {Object} e The event parameter for a simple onInstall trigger.
 */
function onInstall(e) {
	onOpen(e);
	setUserId_();

	var installationSource = ScriptApp.getInstallationSource();

	switch (installationSource) {
	case ScriptApp.InstallationSource.NONE:
		console.info("purchase/NONE");
		break;
	case ScriptApp.InstallationSource.WEB_STORE_ADD_ON:
		console.info("purchase/WEB_STORE_ADD_ON");
		break;
	case ScriptApp.InstallationSource.APPS_MARKETPLACE_DOMAIN_ADD_ON:
		console.info("purchase/APPS_MARKETPLACE_DOMAIN_ADD_ON");
		break;
	default:
		console.info("purchase/DEAFULT");
		break;
	}
}

/**
	* Adds a custom menu with items to show the sidebar and dialog.
	*
	* @param {Object} e The event parameter for a simple onOpen trigger.
	*/
function onOpen(e) {
	var ui = SpreadsheetApp.getUi();
	var menu = ui.createAddonMenu();

	if (e && e.authMode == ScriptApp.AuthMode.NONE) {
		menu.addItem("Start budget sheet", "showDialogSetupAddon_")
			.addSeparator()
			.addItem("About the add-on", "showDialogAboutAddon");
	} else {
		if ( isInstalled_() ) {
      menu.addItem("Add blank rows", "toolAddBlankRows")
        .addItem("Format table", "toolFormatRegistry")
        .addItem("Update cash flow", "toolUpdateCashFlow")
        .addSeparator()
        .addSubMenu(ui.createMenu("Open panel")
          .addItem("Accounts & Cards", "showPanelTables")
          .addItem("Cool Gallery", "showPanelAnalytics"))
        .addSubMenu(ui.createMenu("Pages view")
          .addItem("Collapse", "toolHideSheets_")
          .addItem("Expand", "toolShowSheets_"))
        .addItem("Toggle view mode", "toggleViewMode_")
        .addSeparator()
        .addItem("About the add-on", "showDialogAboutAddon")
        .addItem("Change settings", "showSidebarMainSettings")
        .addItem("Deactive the add-on", "askDeactivation")
        .addItem("Show quickstart", "showPanelQuickstart");

			console.log("open");
		} else {
			menu.addItem("Start budget sheet", "showDialogSetupAddon_")
				.addSeparator()
				.addItem("About the add-on", "showDialogAboutAddon");
		}
	}

	menu.addToUi();
}

function printHrefScriptlets(htmlTemplate) {
	for (var key in RESERVED_HREF) {
		htmlTemplate[key] = RESERVED_HREF[key];
	}
	return htmlTemplate;
}

function showPanelQuickstart() {
	console.log("quickstart");

	var htmlTemplate = HtmlService.createTemplateFromFile("quickstart/htmlQuickstart");
	htmlTemplate = printHrefScriptlets(htmlTemplate);

	const dec_p = getSpreadsheetSettings_("decimal_separator");
	const financial_year = getConstProperties_("financial_year");

	if (dec_p) {
		htmlTemplate.dec_p = ".";
		htmlTemplate.dec_n = "dot";
	} else {
		htmlTemplate.dec_p = ",";
		htmlTemplate.dec_n = "comma";
	}

	htmlTemplate.isCurrent = (financial_year === DATE_NOW.getFullYear());

	var htmlSidebar = htmlTemplate.evaluate().setTitle("Quickstart");
	SpreadsheetApp.getUi().showSidebar(htmlSidebar);
}

function showPanelTables(tab) {
	if (onlineUpdate_()) return;

	var htmlTemplate = HtmlService.createTemplateFromFile("html/htmlSidebarTables");
	htmlTemplate = printHrefScriptlets(htmlTemplate);

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

	var htmlTemplate, htmlSidebar;

	htmlTemplate = HtmlService.createTemplateFromFile("cool_gallery/htmlCoolGallery");
	htmlTemplate = printHrefScriptlets(htmlTemplate);

	htmlTemplate.list = APPS_SCRIPT_GLOBAL.cool_gallery;

	htmlSidebar = htmlTemplate.evaluate().setTitle("Cool Gallery");

	SpreadsheetApp.getUi().showSidebar(htmlSidebar);
}


function showSidebarMainSettings() {
	if (onlineUpdate_()) return;

	var htmlTemplate, htmlSidebar;
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var calendars, editors;

	const user_id = getUserId_();
	const isChangeableByEditors = classAdminSettings_("get", "isChangeableByEditors");

	const isAdmin = (user_id === classAdminSettings_("get", "admin_id"));

	htmlTemplate = HtmlService.createTemplateFromFile("html/htmlUserSettings");
	htmlTemplate = printHrefScriptlets(htmlTemplate);

	htmlTemplate.isAdmin = isAdmin;
	htmlTemplate.isSharedDrive = (spreadsheet.getOwner() == null);
	htmlTemplate.isChangeableByEditors = "";

	if (isAdmin) {
		editors = spreadsheet.getEditors();
		hasEditors = (editors.length > 1);
		calendars = getAllOwnedCalendars();

		if (hasEditors && isChangeableByEditors) {
			htmlTemplate.isChangeableByEditors = "checked";
		}

		htmlTemplate.hasEditors = hasEditors;
		htmlTemplate.isCalendarEnabled = (calendars.md5.length > 0);
		htmlTemplate.calendars_data = calendars;

	} else if (isChangeableByEditors) {
		htmlTemplate.hasEditors = false;
		htmlTemplate.isCalendarEnabled = true;

	} else {
		SpreadsheetApp.getUi().alert(
			"Permission denied",
			"You don't have permission to change the settings.",
			SpreadsheetApp.getUi().ButtonSet.OK);
		return;
	}

	htmlTemplate.doc_name = spreadsheet.getName();
	htmlTemplate.financial_year = getConstProperties_("financial_year");

	htmlSidebar = htmlTemplate.evaluate().setTitle("Settings");

	SpreadsheetApp.getUi().showSidebar(htmlSidebar);
}


function showDialogAboutAddon() {
	try {
		if ( isInstalled_() ) {
			onlineUpdate_();
		}
	} catch (err) {
		ConsoleLog.error(err);
	}

	var htmlDialog, htmlTemplate;
	const v0 = APPS_SCRIPT_GLOBAL.script_version;

	htmlTemplate = HtmlService.createTemplateFromFile("html/htmlAboutAddon");
	htmlTemplate = printHrefScriptlets(htmlTemplate);

	htmlTemplate.version = v0.major + "." + v0.minor + "." + v0.patch;

	htmlDialog = htmlTemplate.evaluate()
		.setWidth(281)
		.setHeight(359);

	SpreadsheetApp.getUi().showModalDialog(htmlDialog, "About the add-on");
}


function showDialogErrorMessage() {
	var htmlTemplate, htmlDialog;

	htmlTemplate = HtmlService.createTemplateFromFile("html/htmlExceptionMessage")
	htmlTemplate = printHrefScriptlets(htmlTemplate);

	htmlDialog = htmlTemplate.evaluate()
		.setWidth(373)
		.setHeight(113);

	SpreadsheetApp.getUi().showModalDialog(htmlDialog, "Something went wrong");
}


function showDialogUpdate() {
	var htmlTemplate, htmlDialog;

	htmlTemplate = HtmlService.createTemplateFromFile("html/htmlUpdateScreen");
	htmlTemplate = printHrefScriptlets(htmlTemplate);

	htmlDialog = htmlTemplate.evaluate()
		.setWidth(263)
		.setHeight(113);

	SpreadsheetApp.getUi().showModalDialog(htmlDialog, "Add-on update");
}


function showDialogSetupAddon_() {
	var ui = SpreadsheetApp.getUi();

  setUserId_();

	if (! isTemplateAvailable()) {
		ui.alert(
			"New version available",
			"Please, re-open the spreadsheet to update the add-on.",
			ui.ButtonSet.OK);
		return;

	} else if ( isInstalled_() ) {
		showDialogSetupEnd();
		onOpen();
		return;

	} else if (PropertiesService.getDocumentProperties().getProperty("lock_spreadsheet")) {
		ui.alert(
			"Can't create budget sheet",
			"The add-on was previously deactivated in this spreadsheet which is now locked.\nPlease start in a new spreadsheet.",
			ui.ButtonSet.OK);
		return;
	}

	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var owner, user;

	owner = spreadsheet.getOwner();
	if (owner) owner = owner.getEmail();
	else owner = "";

	user = Session.getEffectiveUser().getEmail();

	if (owner && owner !== user) {
		ui.alert(
			"Permission denied",
			"You don't own the spreadsheet. Please start in a new spreadsheet.",
			ui.ButtonSet.OK);
		return;

	} else if (spreadsheet.getFormUrl()) {
		ui.alert(
			"Linked form",
			"The spreadsheet has a linked form. Please unlink the form first, or create a new spreadsheet.",
			ui.ButtonSet.OK);
		return;
	}


	ui.alert(
		"Notice to X-Frame-Options Policy",
		"Due to a bug with Google Sheets [1], the setup \"Start budget spreadsheet\" may not be displayed or work correctly.\n\
		If you experience the issue, please use the browser in private/incognito mode to start a new budget sheet.\n\n\
		Learn more: https://github.com/guimspace/budget-n-sheets/wiki/Notice-to-X-Frame-Options-Policy\n\n\
		References\n\
		[1] - Google Issue Tracker - Bug 69270374 https://issuetracker.google.com/issues/69270374\n\
		[2] - Google Account Help - https://support.google.com/accounts/answer/1721977",
		ui.ButtonSet.OK);

	var htmlTemplate, htmlDialog;

	htmlTemplate = HtmlService.createTemplateFromFile("html/htmlSetupAddon");
	htmlTemplate = printHrefScriptlets(htmlTemplate);

	htmlDialog = htmlTemplate.evaluate()
		.setWidth(353)
		.setHeight(359);

	SpreadsheetApp.getUi().showModalDialog(htmlDialog, "Start budget spreadsheet");
}


function showDialogSetupEnd() {
	var htmlTemplate, htmlDialog;

	htmlTemplate = HtmlService.createTemplateFromFile("html/htmlSetupEnd");
	htmlTemplate = printHrefScriptlets(htmlTemplate);

	htmlDialog = htmlTemplate.evaluate()
		.setWidth(353)
		.setHeight(367);

	SpreadsheetApp.getUi().showModalDialog(htmlDialog, "Add-on Budget n Sheets");
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
