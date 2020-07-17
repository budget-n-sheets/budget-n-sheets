function onOpenInstallable_(e) {
	if (e.authMode != ScriptApp.AuthMode.FULL) return;

	try {
		loadCache_();
	} catch (err) {
		consoleLog_("error", "loadCache_()", err);
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
    var sheet =  e.range.getSheet();
		var name = sheet.getName();
	} catch (err) {
	}

  if (['Quick Actions', 'Tags'].indexOf(name) === -1) return;

	if (name === "Quick Actions") {
		try {
			quickActions_(e.range, e.value);
		} catch (err) {
			consoleLog_("error", "quickActions_()", err);
		} finally {
			e.range.setValue("");
		}
	}/* else if (name === "Tags") {
		try {
			tagsCheckbox_(sheet, e.range);
		} catch (err) {
			consoleLog_("error", "tagsCheckbox_()", err);
		}
	}*/
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
		toolPicker_("UpdateCashFlow", mm);
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
	if (! isInstalled_()) return;

	if (seamlessUpdate_()) return;

	var date = getSpreadsheetDate.call(DATE_NOW);
  var trigger

	const yyyymmdd = {
		year: date.getFullYear(),
		month: date.getMonth(),
		date: date.getDate()
	};

	const financial_year = getConstProperties_("financial_year");

	if (financial_year < yyyymmdd.year) {
		treatLayout_(yyyymmdd.year, yyyymmdd.month);
		deleteTrigger_('KeyId', { scope: 'document', key: 'clockTriggerId' })
		Utilities.sleep(300);

		var day = 1 + randomInteger(28);
		var hour = 2 + randomInteger(4);

		trigger = createNewTrigger_('weeklyTriggerPos_', 'onMonthDay', { days: day, hour: hour, minute: -1 })
    saveTriggerId_(trigger, 'document', 'clockTriggerId')

		setSpreadsheetSettings_("operation_mode", "passive");

		console.info("mode/passive");
		return;
	}

	if (yyyymmdd.date === 1) {
		treatLayout_(yyyymmdd.year, yyyymmdd.month);
	}

	if (getUserSettings_("post_day_events")) {
		postEventsForDate_(date);
	}
}

function weeklyTriggerPos_(e) {
	if (isReAuthorizationRequired_()) return;
	if (! isInstalled_()) return;

	seamlessUpdate_();
}

function weeklyTriggerPre_(e) {
	if (isReAuthorizationRequired_()) return;
	if (! isInstalled_()) return;

	if (seamlessUpdate_()) return;

	var date = getSpreadsheetDate.call(DATE_NOW);

	const yyyymm = {
		year: date.getFullYear(),
		month: date.getMonth()
	};

	const financial_year = getConstProperties_("financial_year");

	if (yyyymm.year > financial_year) return;

	deleteTrigger_('KeyId', { scope: 'document', key: 'clockTriggerId' })

	var hour = 2 + randomInteger(4);

	if (yyyymm.year === financial_year) {
		trigger = createNewTrigger_('dailyTrigger_', 'everyDays', { days: 1, hour: hour, minute: -1 })
    saveTriggerId_(trigger, 'document', 'clockTriggerId')
		console.info("mode/active");

	} else {
		var day = 1 + randomInteger(28);
		trigger = createNewTrigger_('weeklyTriggerPos_', 'onMonthDay', { days: day, hour: hour, minute: -1 })
    saveTriggerId_(trigger, 'document', 'clockTriggerId')
	}

	treatLayout_(yyyymm.year, yyyymm.month);
}

function onEdit_Main_(e) {
  try {
    deleteTrigger_('UniqueId', e.triggerUid)
  } catch (err) {
  }
}

function daily_Main_(e) {
  try {
    deleteTrigger_('UniqueId', e.triggerUid)
  } catch (err) {
  }
}

function weekly_Foo_(e) {
  try {
    deleteTrigger_('UniqueId', e.triggerUid)
  } catch (err) {
  }
}

function weekly_Bar_(e) {
  try {
    deleteTrigger_('UniqueId', e.triggerUid)
  } catch (err) {
  }
}
