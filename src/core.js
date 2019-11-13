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

	try {
		trial_onOpen();
	} catch (err) {

	}

	if (e && e.authMode == ScriptApp.AuthMode.NONE) {
		SpreadsheetApp.getUi()
			.createAddonMenu()
			.addItem('Start budget sheet', 'showSetupAddon_')
			.addSeparator()
			.addItem('About the add-on', 'showDialogAboutAddon')
			.addToUi();
	} else {
		if (PropertiesService.getDocumentProperties().getProperty('is_installed')) {
			SpreadsheetApp.getUi()
				.createAddonMenu()
				.addItem('Add blank lines', 'toolAddBlankRows')
				.addItem('Format registry', 'toolFormatRegistry')
				.addItem('Update cash flow', 'toolUpdateCashFlow')
				.addSubMenu(SpreadsheetApp.getUi().createMenu("Pages view")
					.addItem("Collapse", "toolHideSheets_")
					.addItem("Expand", "toolShowSheets_"))
				.addSeparator()
				.addItem('Open Accounts & Cards panel', 'showPanelTables')
				.addItem('Open Analytics panel', 'showPanelAnalytics')
				.addItem('Open Tags panel', 'showPanelTags')
				.addSeparator()
				.addItem('About the add-on', 'showDialogAboutAddon')
				.addItem('Edit settings', 'showSidebarMainSettings')
				.addToUi();

			console.info("add-on/open");
		} else {
			SpreadsheetApp.getUi()
				.createAddonMenu()
				.addItem('Start budget sheet', 'showSetupAddon_')
				.addSeparator()
				.addItem('About the add-on', 'showDialogAboutAddon')
				.addToUi();
		}
	}
}


function showPanelTables() {
	if (onlineUpdate_()) return;
	else if (optMainTables('isBusy') !== -1) {
		SpreadsheetApp.getUi().alert(
			"Add-on is busy",
			"The add-on is busy. Try again a moment.",
			SpreadsheetApp.getUi().ButtonSet.OK);
		return;
	}

	var htmlSidebar = HtmlService.createTemplateFromFile('htmlSidebarTables')
		.evaluate()
		.setTitle('Accounts & Cards');
	SpreadsheetApp.getUi()
		.showSidebar(htmlSidebar);
}


function showPanelTags() {
	if (onlineUpdate_()) return;

	var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Tags");
	if (!sheet) {
		SpreadsheetApp.getUi().alert(
			"Can't open Tags panel",
			"The sheet Tags was not found.",
			SpreadsheetApp.getUi().ButtonSet.OK);
		return;
	}

	var htmlSidebar = HtmlService.createTemplateFromFile('htmlSidebarTags')
		.evaluate()
		.setTitle('Tags');
	SpreadsheetApp.getUi().showSidebar(htmlSidebar);
}


function showPanelTagsStats(tag) {
	var htmlTemplate, htmlDialog;
	var tag;

	htmlTemplate = HtmlService.createTemplateFromFile('htmlSidebarTagsStats');
	tag = optMainTags('GetInfo', tag);

	htmlTemplate.is_initiated = getUserSettings_('MFactor') > 0;

	htmlTemplate.tag_name = tag.Name;
	htmlTemplate.tag_code = tag.Tag;
	htmlTemplate.tag_category = TC_NAME_[tag.C];
	htmlTemplate.tag_description = tag.Description;
	htmlTemplate.tag_analytics = tag.analytics ? "On" : "Off";

	htmlDialog = htmlTemplate.evaluate()
		.setWidth(439)
		.setHeight(509);
	SpreadsheetApp.getUi()
		.showModalDialog(htmlDialog, 'Tag Stats');
}


function showPanelAnalytics() {
	if (onlineUpdate_()) return;

	var htmlTemplate = HtmlService.createTemplateFromFile("htmlCoolGallery");
	var htmlSidebar;

	htmlTemplate.list = AppsScriptGlobal.CoolGallery();

	htmlSidebar = htmlTemplate.evaluate()
		.setTitle("Analytics Gallery (experimental)");

	SpreadsheetApp.getUi().showSidebar(htmlSidebar);
}


function showSidebarMainSettings() {
	if (onlineUpdate_()) return;

	var htmlSidebar = HtmlService.createTemplateFromFile('htmlUserSettings')
		.evaluate()
		.setTitle('Edit settings');
	SpreadsheetApp.getUi()
		.showSidebar(htmlSidebar);
}


function showDialogAboutAddon() {
	try {
		if (getPropertiesService_("document", "", "is_installed")) {
			onlineUpdate_();
		}
	} catch (err) {
		console.error("showDialogAboutAddon()", err);
	}

	var htmlDialog, htmlTemplate;

	htmlTemplate = HtmlService.createTemplateFromFile('htmlAboutAddon')

	htmlTemplate.version = AppsScriptGlobal.AddonVersionName();

	htmlDialog = htmlTemplate.evaluate()
		.setWidth(281)
		.setHeight(359);
	SpreadsheetApp.getUi()
		.showModalDialog(htmlDialog, 'About the add-on');
}


function showDialogErrorMessage() {
	console.warn("showDialogErrorMessage() : Ops...");

	var htmlDialog = HtmlService.createHtmlOutputFromFile("htmlExceptionMessage")
		.setWidth(373)
		.setHeight(113);
	SpreadsheetApp.getUi()
		.showModalDialog(htmlDialog, "Something went wrong");
}


function showDialogQuickMessage(title, text, button, bar) {
	var htmlTemplate, htmlDialog;
	var list;

	if (Array.isArray(text)) list = text;
	else list = [ text ];

	if (title === "") title = "Budget n Sheets";

	htmlTemplate = HtmlService.createTemplateFromFile('htmlQuickMessage');

	htmlTemplate.text = list;
	htmlTemplate.button = button;
	htmlTemplate.bar = bar;

	htmlDialog = htmlTemplate.evaluate()
		.setWidth(307)
		.setHeight(127);

	SpreadsheetApp.getUi()
		.showModalDialog(htmlDialog, title);
}


function showSetupAddon_() {
	var Ui = SpreadsheetApp.getUi();

	try {
		SpreadsheetApp.openById( AppsScriptGlobal.TemplateId() );
	} catch (err) {
		console.warn("showSetupAddon_()", err);

		Ui.alert(
			"Budget n Sheets",
			"The add-on is updating. Try again later.",
			Ui.ButtonSet.OK);

		return;
	}

	if (getPropertiesService_("document", "", "is_installed")) {
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

	var htmlDialog = HtmlService.createTemplateFromFile('htmlSetupAddon')
		.evaluate()
		.setWidth(353)
		.setHeight(359);
	SpreadsheetApp.getUi()
		.showModalDialog(htmlDialog, 'Start budget spreadsheet');
}


function showDialogSetupEnd() {
	var htmlDialog = HtmlService.createTemplateFromFile("htmlSetupEnd")
		.evaluate()
		.setWidth(353)
		.setHeight(359);

	SpreadsheetApp.getUi()
		.showModalDialog(htmlDialog, "Add-on Budget n Sheets");
}
