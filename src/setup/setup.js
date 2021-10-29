function setupService (uuid, payload) {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(200)) {
    SpreadsheetApp2.getUi().alert(
      'Add-on setup in progress',
      'A budget spreadsheet setup is already in progress.',
      SpreadsheetApp2.getUi().ButtonSet.OK);
    return;
  }

  if (!CacheService3.user().get(uuid)) {
    showSessionExpired();
    return;
  }
  CacheService3.user().remove(uuid);

  if (SetupService.checkRequirements() !== 0) throw new Error('Failed to pass requirements check.');

  const config = SetupConfig.digestConfig(uuid, payload);
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  spreadsheet.rename(config.spreadsheet_name);

  new SetupProgress().makeClean()
    .makeConfig(config)
    .copyTemplate()
    .makeInstall();

  try {
    if (payload.protocol === 'restore') new RestoreBackup(config).restore();
    else if (payload.protocol === 'copy') new RestoreCopy(config).copy();
  } catch (err) {
    LogLog.error(err);
  }

  CachedAccess.update('class_version2', {
    script: Info.apps_script.version,
    template: Info.template.version
  });

  new BsAuth(spreadsheet).update();

  spreadsheet.setActiveSheet(spreadsheet.getSheetByName('Summary'));
  PropertiesService3.document().setProperty('is_installed', true);

  try {
    TriggersService.start();
  } catch (err) {
    LogLog.error(err);
  }

  showDialogSetupEnd();
  onOpen();
}
