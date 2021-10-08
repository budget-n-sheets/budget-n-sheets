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

  console.time('setup/' + payload.protocol);
  if (SetupService.checkRequirements() !== 0) throw new Error('Failed to pass requirements check.');

  const config = SetupConfig.digestConfig(uuid, payload);
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  spreadsheet.rename(config.spreadsheet_name);

  new SetupProgress().makeClean()
    .makeConfig(config)
    .copyTemplate()
    .makeInstall();

  if (payload.protocol === 'restore') {
    try {
      new RestoreBackup(config.backup).restore();
    } catch (err) {
      LogLog.error(err);
    }
  } else if (payload.protocol === 'copy') {
    try {
      new RestoreCopy(config.file_id).copy();
    } catch (err) {
      LogLog.error(err);
    }
  }

  CachedAccess.update('class_version2', {
    script: Info.apps_script.version,
    template: Info.template.version
  });

  new BsAuth(spreadsheet).update();

  spreadsheet.setActiveSheet(spreadsheet.getSheetByName('Summary'));
  PropertiesService3.document().setProperty('is_installed', true);
  PropertiesService3.document().deleteProperty('settings_candidate');

  try {
    TriggersService.start();
  } catch (err) {
    LogLog.error(err);
  }

  showDialogSetupEnd();
  onOpen();

  console.timeEnd('setup/' + payload.protocol);
}
