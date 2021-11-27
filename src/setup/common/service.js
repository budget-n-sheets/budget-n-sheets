function cacheSettingsSummary_ (settings) {
  const address = Utilities2.computeDigest(
    'SHA_1',
    ['settings_summary', settings.uuid, settings.protocol].join(':'),
    'UTF_8');
  CacheService3.document().put(address, settings);
}

function retrieveSettingsSummary (uuid, protocol) {
  if (!CacheService3.user().get(uuid)) {
    showSessionExpired();
    return;
  }

  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(1000)) return;

  const address = Utilities2.computeDigest(
    'SHA_1',
    ['settings_summary', uuid, protocol].join(':'),
    'UTF_8');
  const settings = CacheService3.document().get(address);
  if (settings == null) return;
  CacheService3.document().remove(address);
  lock.releaseLock();

  if (settings.settings.financial_calendar) {
    let calendar = null;

    if (protocol === 'copy') {
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
