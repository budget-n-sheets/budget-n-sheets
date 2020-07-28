function coolGallery(option) {
	var lock, s;
	var info;

	info = APPS_SCRIPT_GLOBAL.cool_gallery;
	info = info[option];
	if (!info) {
		ConsoleLog.warn('getCoolSheet_(): Details of page not found.', { option: option, info: info });
		showDialogErrorMessage();
		return 2;
	}

	lock = LockService.getDocumentLock();
	s = lock.tryLock(200);
	if (!s) return 0;
	s = getCoolSheet_(info);
	lock.releaseLock();

	if (s === 0) {
		SpreadsheetApp.getUi().alert(
			"Can't import analytics page",
			"A page with the name \"" + info.sheet_name + "\" already exists. Please rename, or delete the page.",
			SpreadsheetApp.getUi().ButtonSet.OK);
		return -1;
	} else if (s === 1) {
		return 1;
	}

	if (option === "stats_for_tags") {
		coolStatsForTags_(info);
	} else if (option === "filter_by_tag") {
		coolFilterByTag_(info);
	}

	console.info("add-on/cool_gallery/import/", info.sheet_name);
	return -1;
}

function getCoolSheet_(info) {
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var template;

	if (spreadsheet.getSheetByName(info.sheet_name)) return 0;

	try {
		template = SpreadsheetApp.openById(info.id);
	} catch (err) {
		ConsoleLog.error(err);
		return 1;
	}

	template.getSheetByName(info.sheet_name)
		.copyTo(spreadsheet)
		.setName(info.sheet_name);
	SpreadsheetApp.flush();
}
