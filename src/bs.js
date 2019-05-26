function nodeControl_(c, data) {
  var lock = LockService.getDocumentLock();
  try {
    lock.waitLock(200);
  } catch(err) {
    return;
  }

  switch(c) {
    case "sign":
      return signDoc_();
    case "verify":
      return verifySig_(data);
    default:
      console.error("nodeControl_(): Switch case is default.", c);
      break;
  }
}


function signDoc_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName("About");
  var key = PropertiesService.getScriptProperties().getProperty("inner_lock");
  var data, sig;

  if(!key) {
    console.warn("Key 'inner_lock' was not found!");
    return;
  }
  if(!sheet) return;

  data = {
    spreadsheet_id: spreadsheet.getId(),

    addon_version: optGetClass_("AddonVersion"),
    template_version: optGetClass_("TemplateVersion"),

    financial_year: optAddonSettings_Get_("FinancialYear"),
    number_accounts: getPropertiesService_("document", "number", "number_accounts")
  };

  data = JSON.stringify(data);
  data = Utilities.base64Encode(data, Utilities.Charset.UTF_8);

  sig = Utilities.computeHmacSha256Signature(
    data, key,
    Utilities.Charset.UTF_8);
  sig = bin2String(sig);

  sheet.getRange(8, 2).setValue(data + ":" + sig);
  SpreadsheetApp.flush();

  return data + ":" + sig;
}


function verifySig_(data) {
  if(typeof data != "string") return;

  var key = PropertiesService.getScriptProperties().getProperty("inner_lock");
  var sig;

  if(!key) {
    console.warn("Key 'inner_lock' was not found!");
    return;
  }

  data = data.split(":");
  if(data.length !== 2) return;

  sig = Utilities.computeHmacSha256Signature(
    data[0], key,
    Utilities.Charset.UTF_8);
  sig = bin2String(sig);

  if(sig !== data[1]) return;

  return true;
}
