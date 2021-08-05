function getDeveloperKey_ () {
  const scriptCache = CacheService.getScriptCache();
  let key = scriptCache.get('developer_key');

  if (!key) {
    key = PropertiesService.getScriptProperties().getProperty('developer_key');
    if (!key) {
      console.error("getDeveloperKey_(): Key 'developer_key' was not found!");
      return 1;
    }
    scriptCache.put('developer_key', key);
  }

  return key;
}

function getInnerKey_ () {
  const scriptCache = CacheService.getScriptCache();
  let key = scriptCache.get('inner_lock');

  if (!key) {
    key = PropertiesService.getScriptProperties().getProperty('inner_lock');
    if (!key) {
      console.error("getInnerKey_(): Key 'inner_lock' was not found!");
      return 1;
    }
    scriptCache.put('inner_lock', key);
  }

  return key;
}

function bsSignSetup_ () {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();

  const key = getInnerKey_();
  if (key === 1) return 1;

  const const_properties = PropertiesService3.document().getProperty('const_properties');
  if (!const_properties) {
    console.error("bsSignSetup_(): Property 'const_properties' is undefined!");
    return 1;
  }

  const class_version = PropertiesService3.document().getProperty('class_version2');
  if (!class_version) {
    console.error("bsSignSetup_(): Property 'class_version' is undefined!");
    return 1;
  }

  const data = {
    date: DATE_NOW.getTime(),
    spreadsheet_id: spreadsheet.getId(),
    admin_id: SettingsAdmin.getValueOf('admin_id'),
    class_version: class_version
  };

  const stringed = JSON.stringify(data);
  const encoded = Utilities.base64EncodeWebSafe(stringed, Utilities.Charset.UTF_8);
  const sig = Utilities2.computeHmacSignature('SHA_256', encoded, key, 'UTF_8');
  const pack = JSON.stringify({
    encoded: encoded,
    hmac: sig
  });

  const list = spreadsheet.createDeveloperMetadataFinder()
    .withVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
    .withKey('bs_sig')
    .find();

  if (list.length > 0) {
    list[0].setValue(pack);
  } else {
    spreadsheet.addDeveloperMetadata(
      'bs_sig',
      pack,
      SpreadsheetApp.DeveloperMetadataVisibility.PROJECT
    );
  }

  SpreadsheetApp.flush();
}
