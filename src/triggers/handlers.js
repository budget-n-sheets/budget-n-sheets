function dailyTrigger_ (e) {
  ScriptApp.getProjectTriggers().forEach(trigger => {
    if (trigger.getUniqueId() === e.triggerUid) ScriptApp.deleteTrigger(trigger);
  });
}

function weeklyTriggerPos_ (e) {
  ScriptApp.getProjectTriggers().forEach(trigger => {
    if (trigger.getUniqueId() === e.triggerUid) ScriptApp.deleteTrigger(trigger);
  });
}

function onOpenHandler_ (e) {
  if (e.authMode !== ScriptApp.AuthMode.FULL) return;

  try {
    Addon.loadCache();
  } catch (err) {
    LogLog.error(err);
  }
}

function onEditHandler_ (e) {
  if (e.authMode !== ScriptApp.AuthMode.FULL) return;
}

function weeklyHandler_ (e) {
  if (!Addon.isAuthorized()) return;
  if (UpdateService.checkAndUpdate()) return;

  const financial_year = SettingsConst.getValueOf('financial_year');
  if (e.year > financial_year) return;

  treatLayout_(e.year, e.month - 1);
  TriggersService.restart();
}

function dailyHandler_ (e) {
  if (!Addon.isAuthorized()) return;
  if (UpdateService.checkAndUpdate()) return;

  const financial_year = SettingsConst.getValueOf('financial_year');

  const yyyy = e.year;
  const mm = e.month - 1;

  if (financial_year < yyyy) {
    treatLayout_(yyyy, mm);
    TriggersService.restart();
    return;
  }

  if (e['day-of-month'] === 1) {
    treatLayout_(yyyy, mm);
  }

  if (SettingsUser.getValueOf('post_day_events')) {
    const date = Utils.getLocaleDate();
    CalendarService.syncDayWithSpreadsheet(date);
  }
}

function monthlyHandler_ (e) {
  if (!Addon.isAuthorized()) return;
  if (UpdateService.checkAndUpdate()) return;
}
