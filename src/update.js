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
      if(c) break;

    case 55:
      update0pack02_();
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
    console.error("update0packXX_()", err);
    return true;
  }
}*/

/**
 * Reset unprotected ranges of sheet Cards.
 * Reset unprotected ranges of monthly sheets.
 *
 * 0.17.2
 */
function update0pack02_() {
  try {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet, ranges, protections;
    var number_accounts;
    var m, i, j, k;

    number_accounts = getPropertiesService_("document", "number", "number_accounts");

    sheet = spreadsheet.getSheetByName("Cards");
    if(!sheet) return;

    protections = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
    for(i = 0; i < protections.length; i++) {
      if( protections[i].canEdit() ) {
        protections[i].remove();
      }
    }

    ranges = [ ];
    m = sheet.getMaxRows() - 5;
    if(m <= 0) return;
    for(i = 0;  i < 12;  i++) {
      ranges.push( sheet.getRange(6, 1 + 6*i, m, 5) );
      ranges.push( sheet.getRange(2, 1 + 6*i, 1, 3) );
    }
    sheet.protect().setUnprotectedRanges(ranges).setWarningOnly(true);


    for(i = 0;  i < 12;  i++) {
      sheet = spreadsheet.getSheetByName(MN_SHORT_[i]);
      if(!sheet) continue;

      protections = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
      for(j = 0;  j < protections.length;  j++) {
        if( protections[j].canEdit() ) {
          protections[j].remove();
        }
      }

      m = sheet.getMaxRows() - 4;
      if(m <= 0) continue;

      ranges = [ ];
      for(k = 0;  k < 1 + number_accounts;  k++) {
        ranges.push( sheet.getRange(5, 1 + 5*k, m, 4) );
      }
      sheet.protect().setUnprotectedRanges(ranges).setWarningOnly(true);
    }
  } catch(err) {
    console.error("update0pack02_()", err);
    return true;
  }
}

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
    console.error("update0pack01_()", err);
    return true;
  }
}
