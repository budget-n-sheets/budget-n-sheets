function onlineUpdate_(f) {
  try {
    SpreadsheetApp.openById( AppsScriptGlobal.TemplateId() );
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
  var version = optGetClass_("AddonVersion");
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
    SpreadsheetApp.openById(AppsScriptGlobal.TemplateId());
  } catch(err) {
    Logger.log('seamlessUpdate: ' + err.message);
    console.warn("seamlessUpdate_()", err);
    return true;
  }

  var version = optGetClass_("AddonVersion");
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
  if(!getPropertiesService_("", "", "is_installed")) return 1;
  console.time("add-on/Update");

  var lock = LockService.getDocumentLock();
  try {
    lock.waitLock(200);
  } catch(err) {
    return 0;
  }

  var chk = false;
  var v0 = optGetClass_("AddonVersion"),
      v1 = AppsScriptGlobal.AddonVersion();

  switch(v0) {
  default:
    console.warn("update_ExecutePatial_() : Switch case is default.", v0);
    return 0;
  }

  if(chk) {
    Logger.log('addon/Update : Fail.');
    console.info("add-on/Update : Fail.");
    return 1;
  }

  optSetClass_("AddonVersion", v1);
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
