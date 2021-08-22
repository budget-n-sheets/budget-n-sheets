function setupService (uuid, payload) {
  const lock = LockService.getDocumentLock();
  try {
    lock.waitLock(200);
  } catch (err) {
    SpreadsheetApp2.getUi().alert(
      'Add-on setup in progress',
      'A budget spreadsheet setup is already in progress.',
      SpreadsheetApp2.getUi().ButtonSet.OK);
    console.warn(err);
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

  const class_version2 = {
    script: APPS_SCRIPT_GLOBAL.script_version,
    template: APPS_SCRIPT_GLOBAL.template_version
  };
  class_version2.script.beta = PATCH_THIS.beta_list.length;
  PropertiesService3.document().setProperty('class_version2', class_version2);

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
