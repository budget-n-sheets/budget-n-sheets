function onOpen_Main_(e) {
  var date = getSpreadsheetDate();
  var FinancialYear = optAddonSettings_Get_('FinancialYear');

  if(FinancialYear > date.getFullYear()) return;
  else if(FinancialYear == date.getFullYear()) {
    setPropertiesService_('document', 'string', 'OperationMode', 'active');

    deleteScriptAppTriggers_('document', 'weeklyMainId');
    deleteScriptAppTriggers_('document', 'onOpenMainId');
    createScriptAppTriggers_('document', 'dailyMainId', 'everyDays', 'daily_Main_', 1, 2);

    monthly_TreatLayout_(date);

    console.info("add-on/OperationMode: Active");

  } else {
    deleteScriptAppTriggers_('document', 'onOpenMainId');
  }
}


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
  if(testAuthorizationRequired_()) return;
  else if(isMissingSheet()) return;

  if(seamlessUpdate_()) return;

  var date = getSpreadsheetDate();
  var FinancialYear = optAddonSettings_Get_('FinancialYear');

  if(FinancialYear < date.getFullYear()) {
    monthly_TreatLayout_(date);
    deleteScriptAppTriggers_('document', 'dailyMainId');
    createScriptAppTriggers_('document', 'weeklyMainId', 'onWeekDay', 'weekly_Main_', 2);
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


function weekly_Main_(e) {
  if(testAuthorizationRequired_()) return;
  else if(isMissingSheet()) return;

  seamlessUpdate_();
}
