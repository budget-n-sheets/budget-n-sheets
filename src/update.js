function onlineUpdate_() {
  var ui = SpreadsheetApp.getUi();
  try {
    SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty("template_id"));
  } catch(err) {
    console.warn("onlineUpdate_()", err);

    ui.alert("Budget n Sheets",
      "The add-on is updating. Try again later.",
      ui.ButtonSet.OK);
    return true;
  }

  var version = optGetClass_("AddonVersion");
  if(version === AppsScriptGlobal.AddonVersion()) return;

  showDialogQuickMessage("Working on updates...", false, true);

  var b = update_ExecutePatial_();
  if(b === -1) {
    ui.alert("Budget n Sheets",
      "Update completed.",
      ui.ButtonSet.OK);
    return;
  }

  if(b === 1) {
    uninstall_();
    showDialogErrorMessage();
    onOpen();
  } else {
    ui.alert("Budget n Sheets",
      "The add-on is busy. Try again in a moment.",
      ui.ButtonSet.OK);
  }

  return true;
}

function seamlessUpdate_() {
  try {
    SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty("template_id"));
  } catch(err) {
    console.warn("seamlessUpdate_()", err);
    return true;
  }

  var version = optGetClass_("AddonVersion");
  if(version === AppsScriptGlobal.AddonVersion()) return;

  var b = update_ExecutePatial_();
  if(b === -1) return;
  if(b === 1) uninstall_();

  return true;
}


function optGetClass_(a) {
  if(typeof a != "string") return;

  var b = getPropertiesService_("document", "json", "class_version");

  return b[a];
}

function optSetClass_(a, b) {
  if(typeof a != "string") return;

  var c = getPropertiesService_("document", "json", "class_version");

  switch(a) {
    case "AddonVersion":
    case "AddonVersionName":
    case "TemplateVersion":
    case "TemplateVersionName":
      c[a] = b;
      break;
    default:
      console.error("optSetClass_(): Switch case is default", a, b);
      break;
  }

  setPropertiesService_("document", "json", "class_version", c);
}


function update_ExecutePatial_() {
  if(!getPropertiesService_("document", "", "is_installed")) return 1;

  var lock = LockService.getDocumentLock();
  try {
    lock.waitLock(200);
  } catch(err) {
    return 0;
  }

  var c = false;
  var v0 = optGetClass_("AddonVersion"),
      v1 = AppsScriptGlobal.AddonVersion();

  switch(v0) {
    case 54:
      c = update0pack01_();
      break;

    default:
      console.warn("update_ExecutePatial_(): Switch case is default.", v0);
      return 0;
  }

  if(c) {
    console.info("add-on/Update: Fail.");
    return 1;
  }

  optSetClass_("AddonVersion", v1);
  SpreadsheetApp.flush();
  lock.releaseLock();

  console.info("add-on/Update: Success.");
  return -1;
}

/**
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 *
 * X.XX.X
 *
function update0packXX_() {
  try {
  } catch(err) {
    console.warn("update0packXX_()", err);
    return true;
  }
}*/

/**
 * Filter range by initial month and M factor.
 *
 * 0.17.1
 */
function update0pack01_() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Tags");
    var formula;

    formula = "ARRAYFORMULA($S$2:$S/\'_Settings\'!B6)";
    formula = "IF(\'_Settings\'!$B$6 > 0; " + formula + "; 0)";
    formula = "IF(\'_Settings\'!$B$7 > 0; " + formula + "; \"\")";
    formula = "{\"Average\"; " + formula + "}";
    sheet.getRange(1, 18).setFormula(formula);

    formula = "IF(COLUMN(" + rollA1Notation(2, 5, -1, 12) + ") - 4 < \'_Settings\'!$B$4 + \'_Settings\'!$B$6; ROW(" + rollA1Notation(2, 5, -1) + "); 0)";
    formula = "IF(COLUMN(" + rollA1Notation(2, 5, -1, 12) + ") - 4 >= \'_Settings\'!$B$4; " + formula + "; 0)";
    formula = "ARRAYFORMULA(SUMIF(" + formula + "; ROW(" + rollA1Notation(2, 5, -1) + "); " + rollA1Notation(2, 5, -1) + "))";
    formula = "IF(\'_Settings\'!$B$6 > 0; " + formula + "; 0)";
    formula = "IF(\'_Settings\'!$B$7 > 0; " + formula + "; \"\")";
    formula = "{\"Total\"; " + formula + "}";
    sheet.getRange(1, 19).setFormula(formula);
  } catch(err) {
    console.warn("update0pack01_()", err);
    return true;
  }
}
