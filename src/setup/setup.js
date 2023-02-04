/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

function setupService (uuid, payload) {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(200)) {
    SpreadsheetApp2.getUi().alert(
      'Add-on setup in progress',
      'A budget spreadsheet setup is already in progress.',
      SpreadsheetApp2.getUi().ButtonSet.OK);
    return;
  }

  let session;
  try {
    session = SessionService.withUser().getSession(uuid);
  } catch (err) {
    LogLog.error(err);
    showSessionExpired();
    return;
  }

  if (SetupService.checkRequirements() !== 0) throw new Error('Failed to pass requirements check.');

  const config = SetupConfig.digestConfig(uuid, payload);
  session.end();
  session = null;

  const spreadsheet = SpreadsheetApp2.getActive().spreadsheet;
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

  CachedProperties.withDocument().update('class_version2', {
    script: Info.apps_script.version,
    template: Info.template.version
  });
  SpreadsheetApp2.getActive()
    .getMetadata()
    .set('class_version2', {
      script: Info.apps_script.version,
      template: Info.template.version
    })

  spreadsheet.setActiveSheet(spreadsheet.getSheetByName('Summary'));
  PropertiesService2.getDocumentProperties().setProperty('is_installed', true);
  Stamp.seal()

  try {
    TriggersService.start();
  } catch (err) {
    LogLog.error(err);
  }

  showDialogSetupEnd();
  onOpen();
}
