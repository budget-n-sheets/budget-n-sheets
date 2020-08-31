function onOpenInstallable_(e) {
	if (e.authMode != ScriptApp.AuthMode.FULL) return;

	try {
		loadCache_();
	} catch (err) {
    ConsoleLog.error(err);
	}
}

function loadCache_() {
	var isLoaded = CacheService2.get("document", "load_cache", "boolean");
	if (isLoaded) return;

	const list = [ "class_version2", "user_settings", "spreadsheet_settings", "const_properties" ];
	var cache;

	for (var i = 0; i < list.length; i++) {
		cache = PropertiesService2.getProperty("document", list[i], "json");
		if (cache) CacheService2.put("document", list[i], "json", cache);
	}

	cache = PropertiesService2.getProperty("document", "is_installed", "string");
	cache = (cache ? true : false);
	CacheService2.put("document", "is_installed", "boolean", cache);

	getUserId_();

	CacheService2.put("document", "load_cache", "boolean", true);
}

function onEditInstallable_(e) {
	if (e.authMode != ScriptApp.AuthMode.FULL) return;

	try {
    var sheet = e.range.getSheet();
		var name = sheet.getName();
	} catch (err) {
	}

  if (name !== 'Quick Actions' && MN_SHORT.indexOf(name) === -1) return;

	if (name === "Quick Actions") {
		try {
			quickActions_(e.range, e.value);
		} catch (err) {
			ConsoleLog.error(err);
		} finally {
			e.range.setValue("");
		}
	} else {
		try {
			var mm = MN_SHORT.indexOf(name);
			var status = getSpreadsheetSettings_('optimize_load');
			if (status == null || status[mm] === 1) resumeActivity_(mm);
		} catch (err) {
			ConsoleLog.error(err);
		}
	}
}

function tagsCheckbox_(sheet, range) {
  const column = range.getColumn();
  if (column > 5) return;
  if (range.getLastColumn() < 5) return;

  const pos = 4 - column + 1;
  const values = range.getValues();
  const row = range.getRow();

  const list1 = [];
  const list2 = [];

  var i = -1;
  var n1 = 0;
  var n2 = 0;
  while (++i < values.length) {
    if (values[i][pos] === '') list2[n2++] = 'D' + (row + i);
    else list1[n1++] = 'D' + (row + i);
  }

  if (list1.length > 0) sheet.getRangeList(list1).insertCheckboxes();
  if (list2.length > 0) sheet.getRangeList(list2).removeCheckboxes();
  SpreadsheetApp.flush();
}

function quickActions_(range, value) {
	if (value == "") return;

	const row = range.getRow();

	switch (row) {
	case 8:
		toolPicker_("AddBlankRows", "Cards");
		break;
	case 12:
		if (value == "Collapse") pagesView_("hide", 1);
		else if (value == "Expand") pagesView_("show");
		break;

	default:
		break;
	}

	const mm = MN_FULL.indexOf(value);
	if (mm === -1) return;

	switch (row) {
	case 3:
		toolPicker_("AddBlankRows", MN_SHORT[mm]);
		break;
	case 4:
		toolPicker_("FormatAccount", mm);
		break;
	case 5:
		toolPicker_("UpdateCashFlowMm", mm);
		break;

	case 9:
		toolPicker_("FormatCards", mm);
		break;

	default:
		break;
	}
}

function dailyTrigger_(e) {
	if (isReAuthorizationRequired_()) return;
	if (!isInstalled_()) return;
	if (seamlessUpdate_()) return;

	const date = getSpreadsheetDate.call(DATE_NOW);
	const yyyymmdd = {
		year: date.getFullYear(),
		month: date.getMonth(),
		date: date.getDate()
	};

	const financial_year = getConstProperties_("financial_year");

  if (financial_year < yyyymmdd.year) {
    treatLayout_(yyyymmdd.year, yyyymmdd.month);
    rollOperationMode_('passive');
    return;
  }

	if (yyyymmdd.date === 1) {
		treatLayout_(yyyymmdd.year, yyyymmdd.month);

		try {
			if (yyyymmdd.month > 2) {
				switchActivity_('suspend');
			}
		} catch (err) {
			ConsoleLog.error(err);
		}
	}

	if (getUserSettings_("post_day_events")) {
		postEventsForDate_(date);
	}
}

function weeklyTriggerPos_(e) {
	if (isReAuthorizationRequired_()) return;
	if (!isInstalled_()) return;

	seamlessUpdate_();

  if (DATE_NOW.getMonth() % 4 === 0) {
    switchActivity_('suspend');
  }
}

function weeklyTriggerPre_(e) {
	if (isReAuthorizationRequired_()) return;
	if (!isInstalled_()) return;
	if (seamlessUpdate_()) return;

  var mode;
  const financial_year = getConstProperties_('financial_year');
	const date = getSpreadsheetDate.call(DATE_NOW);
	const yyyymm = {
		year: date.getFullYear(),
		month: date.getMonth()
	};

	if (yyyymm.year > financial_year) return;

  treatLayout_(yyyymm.year, yyyymm.month);
  if (yyyymm.year === financial_year) mode = 'active';
  else mode = 'passive'

  rollOperationMode_(mode);
}

function onEdit_Main_(e) {
	deprecateTrigger_(e);
}

function daily_Main_(e) {
	deprecateTrigger_(e);
}

function weekly_Foo_(e) {
	deprecateTrigger_(e);
}

function weekly_Bar_(e) {
	deprecateTrigger_(e);
}

function deprecateTrigger_ (e) {
	try {
		const triggers = ScriptApp.getProjectTriggers();
		for (var i = 0; i < triggers.length; i++) {
			if (triggers[i].getUniqueId() === e.triggerUid) {
				ScriptApp.deleteTrigger(triggers[i]);
				return;
			}
		}
	} catch (err) {
		ConsoleLog.error(err);
	}
}
