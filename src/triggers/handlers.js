function onOpenInstallable_ (e) { onOpenHandler_(e); }
function onOpenHandler_ (e) {
  if (e.authMode !== ScriptApp.AuthMode.FULL) return;

  try {
    AppsScript.loadCache();
  } catch (err) {
    LogLog.error(err);
  }
}

function onEditInstallable_ (e) { onEditHandler_(e); }
function onEditHandler_ (e) {
  if (e.authMode !== ScriptApp.AuthMode.FULL) return;

  const name = e.range.getSheet().getName();
  const mm = Consts.month_name.short.indexOf(name);
  if (mm === -1) return;

  try {
    const load = SettingsSpreadsheet.getValueOf('optimize_load');
    if (load[mm]) RecalculationService.resume(mm, mm + 1);
  } catch (err) {
    LogLog.error(err);
  }
}

function weeklyTriggerPre_ (e) { weeklyHandler_(e); }
function weeklyHandler_ (e) {
  if (!AppsScript.isAuthorized()) return;
  if (UpdateService.checkAndUpdate()) return;

  const financial_year = SettingsConst.getValueOf('financial_year');
  if (e.year > financial_year) return;

  treatLayout_(e.year, e.month - 1);
  TriggersService.restart();
}

function dailyTrigger_ (e) { dailyHandler_(e); }
function dailyHandler_ (e) {
  if (!AppsScript.isAuthorized()) return;
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

    if (mm > 2) {
      try {
        RecalculationService.suspend(0, mm - 2);
      } catch (err) {
        LogLog.error(err);
      }
    }
  }

  if (SettingsUser.getValueOf('post_day_events')) {
    const date = Utils.getLocaleDate();
    CalendarService.syncDayWithSpreadsheet(date);
  }
}

function weeklyTriggerPos_ (e) { monthlyHandler_(e); }
function monthlyHandler_ (e) {
  if (!AppsScript.isAuthorized()) return;
  if (UpdateService.checkAndUpdate()) return;

  if ((e.month - 1) % 3 === 0) RecalculationService.suspend(0, 12);
}
