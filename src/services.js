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

  if(row < 13) {
    mm = mm.indexOf(e.value);
    if(mm === -1) return;
  }

  switch( row ) {
    case 4:
      optMainTools_("AddBlankRows", mm);
      break;
    case 5:
      optMainTools_("FormatRegistry", mm);
      break;
    case 6:
      optMainTools_("UpdateCashFlow", mm);
      break;

    case 9:
      optMainTools_("AddBlankRows", 12);
      break;
    case 10:
      optMainTools_("FormatRegistry", 12+mm);
      break;

    case 13:
      if(e.value == "Collapse") toolHideSheets_();
      else if(e.value == "Expand") toolShowSheets_();
      break;
    default:
      break;
  }

  e.range.setValue("");
}



function daily_Main_(e) {
  if(isReAuthorizationRequired_()) return;
  if(isMissingSheet()) return;
  if(seamlessUpdate_()) return;

  var FinancialYear = optAddonSettings_Get_('FinancialYear');
  var date;

  if(e) {
    date = new Date(e["year"], e["month"], e["day-of-month"], e["hour"]);
    date = getSpreadsheetDate(date);
  } else {
    date = getSpreadsheetDate();
  }

  if(SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetLocale() != optAddonSettings_Get_('SpreadsheetLocale')) {
    if(!update_DecimalSepartor_()) return;
  }

  if(FinancialYear < e["year"]) {
    monthly_TreatLayout_(e["year"], e["month"]);
    deleteScriptAppTriggers_('document', 'dailyMainId');
    createScriptAppTriggers_("document", "weeklyMainId", "onWeekDay", "weekly_Foo_", 2);
    setPropertiesService_('document', 'string', 'OperationMode', "passive");

    console.info("add-on/OperationMode: Passive");
    return;
  }

  if(e["day-of-month"] == 1) {
    monthly_TreatLayout_(e["year"], e["month"]);
  }

  if(optAddonSettings_Get_('PostDayEvents')) {
    daily_PostEvents_(date);
  }

  if(optAddonSettings_Get_('PostDayEvents')  ||  optAddonSettings_Get_('CashFlowEvents')) {
    daily_UpdateEvents_(date);
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
}


function weekly_Bar_(e) {
  if(isReAuthorizationRequired_()) return;
  if(isMissingSheet()) return;

  if(SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetLocale() != optAddonSettings_Get_('SpreadsheetLocale')) {
    if(!update_DecimalSepartor_()) return;
  }

  if(seamlessUpdate_()) return;

  var date = getSpreadsheetDate();
  var yyyy = optAddonSettings_Get_("FinancialYear");

  if(e["year"] > yyyy) return;

  deleteScriptAppTriggers_("document", "weeklyMainId");

  if(e["year"] == yyyy) {
    createScriptAppTriggers_("document", "dailyMainId", "everyDays", "daily_Main_", 1, 2);
  } else {
    createScriptAppTriggers_("document", "weeklyMainId", "onWeekDay", "weekly_Foo_", 2);
  }

  monthly_TreatLayout_(e["year"], e["month"]);
}
