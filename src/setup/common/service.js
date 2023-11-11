/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

function cacheSettingsSummary_ (uuid, settings) {
  SessionService.withUser()
    .getSession(uuid)
    .getContext('addon-setup-service')
    .setProperty('settings', settings)
}

function retrieveSettingsSummary (uuid) {
  const lock = LockService.getDocumentLock()
  if (!lock.tryLock(1000)) return

  const session = SessionService.withUser()
    .trySession(uuid)
    ?.getContext('addon-setup-service')

  if (!session) {
    LogLog.error(err)
    showSessionExpired()
  }

  const protocol = session.getProperty('protocol')
  const settings = session.getProperty('settings')

  lock.releaseLock()
  if (settings == null) return

  if (settings.settings.financial_calendar) {
    let calendar = null

    if (protocol === 'copy' || protocol === 'follow_up') {
      calendar = CalendarApp.getCalendarById(settings.settings.financial_calendar)
      settings.settings.financial_calendar = calendar ? calendar.getName() : ''
    } else if (protocol === 'restore') {
      const calendars = Calendar.listAllCalendars()
      calendar = CalendarUtils.getMetaByHash('SHA_256', calendars, settings.settings.financial_calendar)
      settings.settings.financial_calendar = calendar?.name || ''
    }

    if (!calendar) settings.settings.financial_calendar = '<i>Google Calendar not found or you do not have permission to access it.</i>'
  }

  settings.misc.cards = settings.misc.cards.length > 0 ? settings.misc.cards.join(', ') : '-'
  settings.misc.tags = settings.misc.tags > 0 ? 'Up to ' + settings.misc.tags + ' tag(s) found.' : '-'

  return settings
}

function requestValidateSpreadsheet_ (uuid, fileId) {
  const session = SessionService.withUser()
    .trySession(uuid)
    ?.getContext('addon-setup-service')

  if (!session) {
    showSessionExpired()
    return
  }

  showDialogMessage('Add-on restore', 'Verifying the spreadsheet...', true)
  let status = 0

  try {
    if (!Stamp.verify(fileId)) throw new Error('Verification failed.')
  } catch (err) {
    LogLog.error(err)
    status = 1
  }

  if (status === 0) {
    try {
      SettingsCandidate.processSpreadsheet(uuid, fileId)
    } catch (err) {
      LogLog.error(err)
      status = 3
    }
  }

  session.setProperty('status', status)

  if (status === 0) CacheService2.getUserCache().put(uuid, true)

  if (protocol === 'copy') showDialogSetupCopy(uuid)
  else if (protocol === 'follow_up') showDialogSetupFollowUp(uuid)
}
