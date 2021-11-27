/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

function cacheSettingsSummary_ (settings) {
  SessionService.getSession(settings.uuid).setProperty(`settings/${settings.protocol}`, settings);
}

function retrieveSettingsSummary (uuid, protocol) {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(1000)) return;

  let settings;
  try {
    settings = SessionService.getSession(uuid).getProperty(`settings/${protocol}`);
  } catch (err) {
    settings = null;
    LogLog.error(err);
    showSessionExpired();
  }

  lock.releaseLock();
  if (settings == null) return;

  if (settings.settings.financial_calendar) {
    let calendar = null;

    if (protocol === 'copy' || protocol === 'follow_up') {
      calendar = CalendarApp.getCalendarById(settings.settings.financial_calendar);
      settings.settings.financial_calendar = calendar ? calendar.getName() : '';
    } else if (protocol === 'restore') {
      const calendars = Calendar.listAllCalendars();
      calendar = CalendarUtils.getMetaByHash('SHA_256', calendars, settings.settings.financial_calendar);
      settings.settings.financial_calendar = calendar?.name || '';
    }

    if (!calendar) settings.settings.financial_calendar = '<i>Google Calendar not found or you do not have permission to access it.</i>';
  }

  settings.misc.cards = settings.misc.cards.length > 0 ? settings.misc.cards.join(', ') : '-';
  settings.misc.tags = settings.misc.tags > 0 ? 'Up to ' + settings.misc.tags + ' tag(s) found.' : '-';

  return settings;
}
