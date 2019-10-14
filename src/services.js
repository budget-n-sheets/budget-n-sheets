function onEdit_Main_(e) {
  if(e.authMode != ScriptApp.AuthMode.FULL) return;
  else if(e.range.getSheet().getName() !== "Quick Actions") return;
  else if(e.value == "") return;

  var row = e.range.getRow();
  var mm = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];

  switch( row ) {
    case 4:
			if(mm === -1) break;
      optMainTools_("AddBlankRows", mm);
      break;
    case 5:
			if(mm === -1) break;
      optMainTools_("FormatRegistry", mm);
      break;
    case 6:
			if(mm === -1) break;
      optMainTools_("UpdateCashFlow", mm);
      break;

    case 9:
      optMainTools_("AddBlankRows", 12);
      break;
    case 10:
			if(mm === -1) break;
      optMainTools_("FormatRegistry", 12+mm);
      break;

    case 13:
      if(e.value == "Collapse") toolHideSheets_();
      else if(e.value == "Expand") toolShowSheets_();
      break;
    default:
      return;
  }

  e.range.setValue("");
}



function daily_Main_(e) {
  if(isReAuthorizationRequired_()) return;
  if(isMissingSheet()) return;
  if(seamlessUpdate_()) return;

  var FinancialYear = optAddonSettings_Get_('FinancialYear');
  var date, a;

  if(e) {
    date = new Date(e["year"], e["month"] - 1, e["day-of-month"], e["hour"]);
    date = getSpreadsheetDate(date);
  } else {
    date = getSpreadsheetDate();
  }

	a = {
		"year": date.getFullYear(),
		"month": date.getMonth(),
		"date": date.getDate()
	};

  if(SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetLocale() != optAddonSettings_Get_('SpreadsheetLocale')) {
    if(!update_DecimalSepartor_()) return;
  }

  if(FinancialYear < a["year"]) {
    monthly_TreatLayout_(a["year"], a["month"]);
    deleteScriptAppTriggers_('document', 'dailyMainId');
    createScriptAppTriggers_("document", "weeklyMainId", "onWeekDay", "weekly_Foo_", 2);
    setPropertiesService_('document', 'string', 'OperationMode', "passive");

    console.info("add-on/OperationMode: Passive");
    return;
  }

	if(getPropertiesService_("document", "string", "update_layout")) {
		update_Layout();
		deletePropertiesService_("document", "update_layout");
	}

  if(a["date"] == 1) {
    monthly_TreatLayout_(a["year"], a["month"]);
  }

  if(optAddonSettings_Get_("PostDayEvents")) {
    daily_PostEvents_(date);
  }

  return;
}


function weekly_Foo_(e) {
  if(isReAuthorizationRequired_()) return;
  if(isMissingSheet()) return;

  if(SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetLocale() != optAddonSettings_Get_('SpreadsheetLocale')) {
    if(!update_DecimalSepartor_()) return;
  }

  seamlessUpdate_();

	if(getPropertiesService_("document", "string", "update_layout")) {
		update_Layout();
		deletePropertiesService_("document", "update_layout");
	}
}


function weekly_Bar_(e) {
  if(isReAuthorizationRequired_()) return;
  if(isMissingSheet()) return;

  if(SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetLocale() != optAddonSettings_Get_('SpreadsheetLocale')) {
    if(!update_DecimalSepartor_()) return;
  }

  if(seamlessUpdate_()) return;

	if(getPropertiesService_("document", "string", "update_layout")) {
		update_Layout();
		deletePropertiesService_("document", "update_layout");
	}

  var date = getSpreadsheetDate();
  var yyyy = optAddonSettings_Get_("FinancialYear");

  if(e["year"] > yyyy) return;

  deleteScriptAppTriggers_("document", "weeklyMainId");

  if(e["year"] == yyyy) {
    createScriptAppTriggers_("document", "dailyMainId", "everyDays", "daily_Main_", 1, 2);
  } else {
    createScriptAppTriggers_("document", "weeklyMainId", "onWeekDay", "weekly_Foo_", 2);
  }

  monthly_TreatLayout_(e["year"], e["month"] - 1);
}
