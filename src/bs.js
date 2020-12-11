function getDeveloperKey_ () {
  const scriptCache = CacheService.getScriptCache()
  let key = scriptCache.get('developer_key')

  if (!key) {
    key = PropertiesService.getScriptProperties().getProperty('developer_key')
    if (!key) {
      ConsoleLog.error("getDeveloperKey_(): Key 'developer_key' was not found!")
      return 1
    }
    scriptCache.put('developer_key', key)
  }

  return key
}

function bsSignSetup_ () {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet, i;

  i = -1;
  while (!sheet && ++i < 3) {
    sheet = getAboutPage_(spreadsheet);
  }
  if (sheet === 1 || i >= 3) {
    ConsoleLog.error('bsSignSetup_(): Failed to find About page.');
    return 1;
  }

  const key = PropertiesService.getScriptProperties().getProperty('inner_lock');
  if (!key) {
    ConsoleLog.error("bsSignSetup_(): Key 'inner_lock' was not found!");
    return 1;
  }

  const const_properties = PropertiesService2.getProperty("document", "const_properties", "json");
  if (!const_properties) {
    ConsoleLog.error("bsSignSetup_(): Property 'const_properties' is undefined!");
    return 1;
  }

  const class_version = PropertiesService2.getProperty("document", "class_version2", "json");
  if (!class_version) {
    ConsoleLog.error("bsSignSetup_(): Property 'class_version' is undefined!");
    return 1;
  }

  const data = {
    date: DATE_NOW.getTime(),
    spreadsheet_id: spreadsheet.getId(),
    admin_id: getAdminSettings_('admin_id'),
    class_version: class_version
  };

  const stringed = JSON.stringify(data);
  const encoded = Utilities.base64EncodeWebSafe(stringed, Utilities.Charset.UTF_8);
  const sig = computeHmacSignature("SHA_256", encoded, key, "UTF_8");
  const package = JSON.stringify({
    encoded: encoded,
    hmac: sig
  });

  const list = sheet.getDeveloperMetadata();
  let status = 0;

  for (let i = 0; i < list.length; i++) {
    if (list[i].getKey() === 'bs_sig') {
      list[i].setVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
        .setValue(package);
      status = 1;
      break;
    }
  }

  if (!status) {
    sheet.addDeveloperMetadata(
      'bs_sig',
      package,
      SpreadsheetApp.DeveloperMetadataVisibility.PROJECT
    );
  }

  SpreadsheetApp.flush();
}

function getAboutPage_ (spreadsheet) {
  var sheet = spreadsheet.getSheetByName('_About BnS');
  if (sheet) return sheet;

  sheet = importAboutPage_(spreadsheet);
  if (sheet === 1) return 1;

  return sheet;
}

function importAboutPage_ (spreadsheet) {
	try {
		var source = SpreadsheetApp.openById(APPS_SCRIPT_GLOBAL.template_id);
	} catch (err) {
		ConsoleLog.error(err);
		return 1;
	}

  try {
    var sheet = source.getSheetByName("_About BnS")
      .copyTo(spreadsheet)
      .setName("_About BnS")
      .setTabColor("#6aa84f")
      .hideSheet();

    sheet.addDeveloperMetadata(
      'bs_sig',
      '{}',
      SpreadsheetApp.DeveloperMetadataVisibility.PROJECT
    );

    sheet.protect().setWarningOnly(true);
    SpreadsheetApp.flush();
  } catch (err) {
		ConsoleLog.error(err);
		return 1;
	}

  return sheet;
}
