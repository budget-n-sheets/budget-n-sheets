function setupService (uuid, payload) {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(100)) {
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

  payload.uuid = uuid;
  const config = SetupConfig.digestConfig(payload);
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  spreadsheet.rename(config.spreadsheet_name);

  new SetupProgress().makeClean()
    .makeConfig(config)
    .copyTemplate()
    .makeInstall();

  if (payload.protocol === 'restore') {
    restoreFromBackup_(config.backup);
  } else if (payload.protocol === 'copy') {
    restoreFromSpreadsheet_(config.file_id);
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

  console.timeEnd('setup/' + payload.protocol);
}
