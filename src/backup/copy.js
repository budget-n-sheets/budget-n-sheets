function validateSpreadsheet (fileId) {
  if (isInstalled_()) return 1;

  try {
    var file = DriveApp.getFileById(fileId);

    const owner = file.getOwner().getEmail();
    const user = Session.getEffectiveUser().getEmail();

    if (owner !== user) return 2;
  } catch (err) {
    ConsoleLog.error(err);
    return 2;
  }

  if (file.getMimeType() !== MimeType.GOOGLE_SHEETS) return 3;

  try {
    var spreadsheet = SpreadsheetApp.openById(fileId);
    const sheet = spreadsheet.getSheetByName('About');
    if (!sheet) return 3;

    const inner_key = PropertiesService.getScriptProperties().getProperty('inner_lock');
    if (!inner_key) {
      ConsoleLog.error("validateSpreadsheet(): Key 'inner_lock' was not found!");
      return 1;
    }

    const displayValue = sheet.getRange(8, 2).getDisplayValue();

    var parts = displayValue.split(':');
    const sha = computeHmacSignature('SHA_256', parts[0], inner_key, 'UTF_8');

    if (sha !== parts[1]) return 3;
  } catch (err) {
    ConsoleLog.error(err);
    return 3;
  }

  const webSafeCode = parts[0];
  const string = base64DecodeWebSafe(webSafeCode, 'UTF_8');
  const data = JSON.parse(string);

  if (data.spreadsheet_id !== fileId) return 2;
  if (data.admin_id !== getUserId_()) return 2;

  return info;
}
