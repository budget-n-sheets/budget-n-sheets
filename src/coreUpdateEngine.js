function onlineUpdate_(f) {
  try {
    SpreadsheetApp.openById( AppsScriptGlobal.SpreadsheetTemplateId() );
  } catch(err) {
    Logger.log('onlineUpdate: ' + err.message);
    console.warn("onlineUpdate_()", err);

    SpreadsheetApp.getUi().alert(
      "Budget n Sheets",
      "The add-on is updating. Try again later.",
      SpreadsheetApp.getUi().ButtonSet.OK);
    return true;
  }

  var Ui = SpreadsheetApp.getUi();
  var version = getPropertiesService_('document', 'number', 'LNE_VERSION');
  var dateTodayValue = new Date().getTime();
  var listRequiredVersion;
  var htmlDialog;
  var b;


  if(version === AppsScriptGlobal.AddonVersion()) {
    return;
  } else {
    showDialogQuickMessage("Working on updates...", false, true);

    b = update_ExecutePatial_();
    if(b === 1) {
      uninstall_();
      showDialogErrorMessage();
      onOpen();
    } else if(b === -1) {
      Ui.alert(
        "Budget n Sheets",
        "Update completed.",
        Ui.ButtonSet.OK);
      return;
    } else {
      Ui.alert(
        "Budget n Sheets",
        "The add-on is busy. Try again in a moment.",
        Ui.ButtonSet.OK);
    }
  }

  return true;
}


function seamlessUpdate_() {
  try {
    SpreadsheetApp.openById(AppsScriptGlobal.SpreadsheetTemplateId());
  } catch(err) {
    Logger.log('seamlessUpdate: ' + err.message);
    console.warn("seamlessUpdate_()", err);
    return true;
  }

  var version = getPropertiesService_('document', 'number', 'LNE_VERSION');
  var dateTodayValue = new Date().getTime();
  var b;


  if(version === AppsScriptGlobal.AddonVersion()) return;
  else {
    b = update_ExecutePatial_();
    if(b === 1) {
      uninstall_();
    } else if(b === -1) {
      return;
    }
  }

  return true;
}



function update_ExecutePatial_() {
  if(!getPropertiesService_('document', 'boolean', 'LazyNotesExtras')) return 1;
  console.time("add-on/Update");
  var lock, chk;

  lock = LockService.getDocumentLock();
  chk = lock.tryLock(100);
  if(!chk) return 0;


  var v0 = getPropertiesService_('document', 'number', 'LNE_VERSION'),
      v1 = AppsScriptGlobal.AddonVersion();

  chk = false;

  switch(v0) {
  case 45:
    chk = update0pack40_();
    if(chk) break;
  case 46:
    chk = update0pack41_();
    if(chk) break;
  case 47:
    chk = update0pack42_();
    if(chk) break;
  case 48:
    update0pack43_();
  case 49:
    update0pack44_();
  case 50:
    chk = update0pack45_();
    if(chk) break;
  case 51:
    chk = update0pack46_();
    if(chk) break;
  case 52:
    update0pack47_();
  case 53:
    chk = update0pack48_();
    break;
  default:
    console.warn("update_ExecutePatial_() : Switch case is default.", v0);
    return 0;
  }

  if(chk) {
    Logger.log('addon/Update : Fail.');
    console.info("add-on/Update : Fail.");
    return 1;
  }

  setPropertiesService_('document', 'number', 'LNE_VERSION', v1);
  SpreadsheetApp.flush();
  lock.releaseLock();

  console.timeEnd("add-on/Update");
  Logger.log('addon/Update : Success.');
  console.info("add-on/Update : Success.");
  return -1;
}



/**
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 *
 * X.XX.X
 *
function update0packXX_() {
  console.time("update/pack-XX");
  try {
  } catch(err) {
    Logger.log('update0packXX_() : ' + err.message);
    console.warn("update0packXX_()", err);
    return true;
  }
  console.timeEnd("update/pack-XX");
}*/

/**
 * Initialize property 'is_installed'.
 * Reinstall all cards.
 *
 *
 * 0.16.1
 */
function update0pack48_() {
  console.time("update/pack-48");
  try {
    var DB_CARD, i;

    PropertiesService.getDocumentProperties().setProperty("is_installed", "[ ]");

    DB_CARD = getPropertiesService_("document", "json", "DB_CARD");

    for(i = 0; i < DB_CARD.length; i++) {
      optMainTables("RemoveCard", DB_CARD[i].Id);
      SpreadsheetApp.flush();
      Utilities.sleep(200);

      optMainTables("AddCard", DB_CARD[i]);
      SpreadsheetApp.flush();
      Utilities.sleep(200);
    }
  } catch(err) {
    Logger.log('update0pack48_() : ' + err.message);
    console.warn("update0pack48_()", err);
    return true;
  }
  console.timeEnd("update/pack-48");
}

/**
  * Reinstall triggers.
  *
  * v0.13.14
  */
function update0pack40_() {
  try {
    var FinancialYear = optAddonSettings_Get_('FinancialYear');
    var dateToday = getSpreadsheetDate();


    setPropertiesService_('document', 'string', 'onOpenMainId', '');
    setPropertiesService_('document', 'string', 'dailyMainId', '');
    setPropertiesService_('document', 'string', 'weeklyMainId', '');

    purgeScriptAppTriggers_();

    if(FinancialYear < dateToday.getFullYear()) {
      createScriptAppTriggers_('document', 'weeklyMainId', 'onWeekDay', 'weekly_Main_', 2);

    } else if(FinancialYear === dateToday.getFullYear()) {
      createScriptAppTriggers_('document', 'dailyMainId', 'everyDays', 'daily_Main_', 1, 2);

    } else if(FinancialYear > dateToday.getFullYear()) {
      createScriptAppTriggers_('document', 'onOpenMainId', 'onOpen', 'onOpen_Main_');
      createScriptAppTriggers_('document', 'weeklyMainId', 'onWeekDay', 'weekly_Main_', 2);
    }
  } catch(err) {
    Logger.log('update0pack40_() : ' + err.message);
    console.warn("update0pack40_()", err);
    return true;
  }
}


/**
  * Remove doc_uuid.
  *
  * v0.13.15
  */
function update0pack41_() {
  try {

    setPropertiesService_('document', 'string', 'doc_uuid', '');

  } catch(err) {
    Logger.log('update0pack41_() : ' + err.message);
    console.warn("update0pack41_()", err);
    return true;
  }
}


/**
  * Rename sheets 'Settings' and 'Backstage'.
  * Redefine parameters for 'LNEINFCARD'.
  *
  * v0.14.0
  */
function update0pack42_() {
  try {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet(),
        sheetCards = spreadsheet.getSheetByName('Cards');
    var db = getPropertiesService_('document', 'json', 'DB_CARD');
    var number_accounts;
    var range, a, m,
        i;


    for(i = 0;  i < 12;  i++) {
      sheetCards.getRange(2, 1+i*6).setValue(null);
      sheetCards.getRange(2, 4+i*6).setValue(null);
    }
    SpreadsheetApp.flush();

    spreadsheet.getSheetByName('Backstage')
      .setName('_Backstage');
    spreadsheet.getSheetByName('Settings')
      .setName('_Settings');

    if(db.length > 0) {
      number_accounts = getPropertiesService_('document', 'number', 'number_accounts');

      m = spreadsheet.getSheetByName('_Backstage')
        .getMaxColumns() - db.length + 1;
      a = rollA1Notation(1, m-1, 1, db.length+1);

      for(i = 0;  i < 12;  i++) {
        range = sheetCards.getRange(2, 1+i*6);
        range.setValue('All');

        sheetCards.getRange(2, 4+i*6)
          .setFormula('LNEINFCARD(OFFSET(INDIRECT(ADDRESS(2; '+(3+number_accounts*3+1)+'+MATCH('+range.getA1Notation()+'; \'_Backstage\'!'+a+'; 0); 4; true; "_Backstage")); '+(i*6)+'; 0; 6; 1))');
      }
    }

  } catch(err) {
    Logger.log('update0pack42_() : ' + err.message);
    console.warn("update0pack42_()", err);
    return true;
  }
}


/**
  * Update combo chart in sheet Summary.
  *
  * v0.14.1
  */
function update0pack43_() {
  try {

    var sheet = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName('Summary');
    var InitialMonth = optAddonSettings_Get_('InitialMonth');
    var charts, i;


    charts = sheet.getCharts();
    for(i in charts) {
      sheet.removeChart(charts[i]);
    }

    setupPart9_(sheet, InitialMonth);

  } catch(err) {
    Logger.log('update0pack43_() : ' + err.message);
    console.warn("update0pack43_()", err);
    return true;
  }
}


/**
  * Set boolean value to option "OnlyEventsOwned".
  * Sort sheet order.
  * Fire monthly_TreatLayout_().
  *
  * v0.14.2
  */
function update0pack44_() {
  try {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var date = getSpreadsheetDate();
    var db_cards;

    optAddonSettings_Set_("OnlyEventsOwned", false);

    sortSheetOrder_(spreadsheet);
    Utilities.sleep(2003);

    db_cards = getPropertiesService_('document', 'json', 'DB_CARD');
    if(db_cards.length === 0) {
      spreadsheet.getSheetByName("Cards").hideSheet();
    }
    spreadsheet.getSheetByName("_Settings").hideSheet();
    spreadsheet.getSheetByName("_Backstage").hideSheet();
    spreadsheet.getSheetByName("About").hideSheet();

    monthly_TreatLayout_(date);
  } catch(err) {
    Logger.log('update0pack44_() : ' + err.message);
    console.warn("update0pack44_()", err);
    return true;
  }
}


/**
  * Sets key-value pair.
  *
  * 0.14.3
  */
function update0pack45_() {
  try {
    var documentProperties = PropertiesService.getDocumentProperties();
    var value;

    value = documentProperties.getProperty("LneUserSettings");
    documentProperties.setProperty("user_settings", value);

    value = documentProperties.getProperty("NumberLneAccount");
    documentProperties.setProperty("number_accounts", value);

  } catch(err) {
    Logger.log('update0pack45_() : ' + err.message);
    console.warn("update0pack45_()", err);
    return true;
  }
}


/**
  * Install QuickFire.
  *
  * 0.15.0
  */
function update0pack46_() {
  console.time("update/pack-46");
  try {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet(),
        sheet, range;


    sheet = spreadsheet.getSheetByName("Quick Actions");
    if(sheet) {
      sheet.copyTo(spreadsheet);
      spreadsheet.deleteSheet(sheet);
    }


    sheet = SpreadsheetApp.openById( AppsScriptGlobal.SpreadsheetTemplateId() )
      .getSheetByName("Quick Actions")
      .copyTo(spreadsheet)
      .setName("Quick Actions")
      .setTabColor('#6aa84f');


    range = [ ];
    range.push( sheet.getRange(4, 2, 3, 1) );
    range.push( sheet.getRange(9, 2, 2, 1) );

    sheet.protect()
      .setUnprotectedRanges(range)
      .setWarningOnly(true);


    setPropertiesService_('document', 'string', 'onEditMainId', '');
    createScriptAppTriggers_('document', 'onEditMainId', 'onEdit', 'onEdit_Main_');


    sortSheetOrder_(spreadsheet);
  } catch(err) {
    Logger.log('update0pack46_() : ' + err.message);
    console.warn("update0pack46_()", err);
    return true;
  }
  console.timeEnd("update/pack-46");
}


/**
  * Reinstall triggers.
  *
  * 0.15.0
  */
function update0pack47_() {
  console.time("update/pack-47");
  try {
    var FinancialYear = optAddonSettings_Get_('FinancialYear');
    var dateToday = getSpreadsheetDate();


    setPropertiesService_('document', 'string', 'onOpenMainId', '');
    setPropertiesService_('document', 'string', 'onEditMainId', '');
    setPropertiesService_('document', 'string', 'dailyMainId', '');
    setPropertiesService_('document', 'string', 'weeklyMainId', '');

    purgeScriptAppTriggers_();

    createScriptAppTriggers_('document', 'onEditMainId', 'onEdit', 'onEdit_Main_');

    if(FinancialYear < dateToday.getFullYear()) {
      setPropertiesService_('document', 'string', 'OperationMode', 'passive');
      createScriptAppTriggers_('document', 'weeklyMainId', 'onWeekDay', 'weekly_Main_', 2);

    } else if(FinancialYear === dateToday.getFullYear()) {
      setPropertiesService_('document', 'string', 'OperationMode', 'active');
      createScriptAppTriggers_('document', 'dailyMainId', 'everyDays', 'daily_Main_', 1, 2);

    } else if(FinancialYear > dateToday.getFullYear()) {
      setPropertiesService_('document', 'string', 'OperationMode', 'passive');
      createScriptAppTriggers_('document', 'onOpenMainId', 'onOpen', 'onOpen_Main_');
      createScriptAppTriggers_('document', 'weeklyMainId', 'onWeekDay', 'weekly_Main_', 2);
    }
  } catch(err) {
    Logger.log('update0pack47_() : ' + err.message);
    console.warn("update0pack47_()", err);
    return true;
  }
  console.timeEnd("update/pack-47");
}
