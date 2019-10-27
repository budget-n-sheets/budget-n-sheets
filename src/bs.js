function nodeControl_(c, data) {
  var lock = LockService.getDocumentLock();
	var r;
  try {
    lock.waitLock(200);
  } catch(err) {
    return 0;
  }

  switch(c) {
    case "sign":
			r = signDoc_();
			break;
    case "verify":
			r = verifySig_(data);
			break;

    default:
      console.error("nodeControl_(): Switch case is default.", c);
			r = 1;
      break;
  }

	// lock.releaseLock();
	return r;
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
	sig = computeHmacSignature("SHA_256", data, key, "UTF_8");

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

	sig = computeHmacSignature("SHA_256", data[0], key, "UTF_8");

  if(sig !== data[1]) return;

  return true;
}
