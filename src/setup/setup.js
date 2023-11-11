/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

function setupService (uuid, config) {
  const lock = LockService.getDocumentLock()
  if (!lock.tryLock(200)) {
    SpreadsheetApp2.getUi().alert(
      'Add-on setup in progress',
      'A budget spreadsheet setup is already in progress.',
      SpreadsheetApp2.getUi().ButtonSet.OK)
    return
  }

  const session = SessionService.withUser()
    .trySession(uuid)
    ?.getContext('addon-setup-service')

  if (!session) {
    showSessionExpired()
    return
  }

  if (SetupService.checkRequirements() !== 0) throw new Error('Failed to pass requirements check.')

  const protocol = session.getProperty('protocol')
  const digest = SetupConfig.digestConfig(protocol, uuid, config)

  const spreadsheet = SpreadsheetApp2.getActive().spreadsheet
  spreadsheet.rename(digest.spreadsheet_name)

  new SetupProgress().makeClean()
    .makeConfig(digest)
    .makeInstall()

  try {
    if (protocol === 'restore') new RestoreBackup(digest).restore()
    else if (protocol === 'copy') new RestoreCopy(digest).copy()
    else if (protocol === 'follow_up') new SetupFollowUp(digest).copy()
  } catch (err) {
    LogLog.error(err)
  }

  CachedProperties.withDocument().update('class_version2', {
    script: Info.apps_script.version,
    template: Info.template.version
  })
  SpreadsheetApp2.getActive()
    .getMetadata()
    .set('class_version2', {
      script: Info.apps_script.version,
      template: Info.template.version
    })

  spreadsheet.setActiveSheet(spreadsheet.getSheetByName('Summary'))
  PropertiesService2.getDocumentProperties().setProperty('is_installed', true)
  Stamp.seal()

  try {
    TriggersService.start()
  } catch (err) {
    LogLog.error(err)
  }

  showDialogSetupEnd()
  onOpen()
}
