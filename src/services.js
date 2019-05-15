function onEdit_Main_(e) {
  if(e.authMode != ScriptApp.AuthMode.FULL) return;
  else if(e.range.getSheet().getName() !== "Quick Actions") return;
  else if(e.value == "") return;

  var mm = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ].indexOf(e.value);

  if(mm === -1) return;


  switch( e.range.getRow() ) {
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
    default:
      break;
  }

  e.range.setValue(null);
}



function daily_Main_(e) {
  if(isReAuthorizationRequired_()) return;
  else if(isMissingSheet()) return;

  if(seamlessUpdate_()) return;

  var date = getSpreadsheetDate();
  var FinancialYear = optAddonSettings_Get_('FinancialYear');

  if(SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetLocale() != optAddonSettings_Get_('SpreadsheetLocale')) {
    update_DecimalSepartor_();
  }

  if(FinancialYear < date.getFullYear()) {
    monthly_TreatLayout_(date);
    deleteScriptAppTriggers_('document', 'dailyMainId');
    createScriptAppTriggers_("document", "weeklyMainId", "onWeekDay", "weekly_Foo_", 2);
    setPropertiesService_('document', 'string', 'OperationMode', "passive");

    console.info("add-on/OperationMode: Passive");

    return;
  }

  if(date.getDate() == 1) {
    monthly_TreatLayout_(date);
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

  seamlessUpdate_();
}


function weekly_Bar_(e) {
  if(isReAuthorizationRequired_()) return;
  if(isMissingSheet()) return;

  if(seamlessUpdate_()) return;

  var date = getSpreadsheetDate();
  var yyyy = optAddonSettings_Get_("FinancialYear");

  if(date.getFullYear() > yyyy) return;

  deleteScriptAppTriggers_("document", "weeklyMainId");

  if(date.getFullYear() == yyyy) {
    createScriptAppTriggers_("document", "dailyMainId", "everyDays", "daily_Main_", 1, 2);
  } else {
    createScriptAppTriggers_("document", "weeklyMainId", "onWeekDay", "weekly_Foo_", 2);
  }

  monthly_TreatLayout_(date);
}
