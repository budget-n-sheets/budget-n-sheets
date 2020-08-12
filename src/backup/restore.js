function validateBackup (fileId) {
  if (isInstalled_()) return 1;

  const lock = LockService.getDocumentLock();
  try {
    lock.waitLock(200);
  } catch (err) {
    return 1;
  }

  if (CacheService2.get('user', 'OAuthToken', 'string') == null) return 1;
  CacheService2.remove('user', 'OAuthToken');
  lock.releaseLock();

  try {
    const file = DriveApp.getFileById(fileId);
  } catch (err) {
    console.log(err);
    return 2;
  }

  const blob = file.getBlob().getAs('text/plain');
  const raw = blob.getDataAsString();

  const parts = raw.split(':');
  const sha = computeDigest('SHA_1', parts[0], 'UTF_8');
  if (sha !== parts[1]) return 3;

  const webSafeCode = parts[0];
  const string = base64DecodeWebSafe(webSafeCode, 'UTF_8');
  const data = JSON.parse(string);

  const info = {
    file_name: file.getName(),
    date_created: new Date(data.backup.date_request).toString(),
    spreadsheet_title: data.spreadsheet_title,
    financial_year: data.const_properties.financial_year,
    initial_month: MN_FULL[data.user_settings.initial_month]
  };

  return info;
}
