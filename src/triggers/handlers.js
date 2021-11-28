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
  if (!AppsScript.isInstalled()) return;
  if (UpdateService.checkAndUpdate()) return;

  const financial_year = SettingsConst.getValueOf('financial_year');
  const date = Utils.getLocaleDate();
  const yyyymm = {
    year: date.getFullYear(),
    month: date.getMonth()
  };

  if (yyyymm.year > financial_year) return;

  treatLayout_(yyyymm.year, yyyymm.month);
  TriggersService.restart();
}

function dailyTrigger_ (e) { dailyHandler_(e); }
function dailyHandler_ (e) {
  if (!AppsScript.isInstalled()) return;
  if (UpdateService.checkAndUpdate()) return;

  const date = Utils.getLocaleDate();
  const yyyymmdd = {
    year: date.getFullYear(),
    month: date.getMonth(),
    date: date.getDate()
  };

  const financial_year = SettingsConst.getValueOf('financial_year');

  if (financial_year < yyyymmdd.year) {
    treatLayout_(yyyymmdd.year, yyyymmdd.month);
    TriggersService.restart();
    return;
  }

  if (yyyymmdd.date === 1) {
    treatLayout_(yyyymmdd.year, yyyymmdd.month);

    try {
      if (yyyymmdd.month > 2) {
        RecalculationService.suspend(0, yyyymmdd.month - 2);
      }
    } catch (err) {
      LogLog.error(err);
    }
  }

  if (SettingsUser.getValueOf('post_day_events')) {
    CalendarService.syncDayWithSpreadsheet(date);
  }
}

function weeklyTriggerPos_ (e) { monthlyHandler_(e); }
function monthlyHandler_ (e) {
  if (!AppsScript.isInstalled()) return;

  UpdateService.checkAndUpdate();

  const date = Utils.getLocaleDate();
  const month = date.getMonth();

  if (month % 3 !== 0) return;

  const financial_year = SettingsConst.getValueOf('financial_year');
  const yyyy = date.getFullYear();

  if (yyyy > financial_year) {
    RecalculationService.suspend(0, 12);
  } else if (yyyy === financial_year && month > 2) {
    RecalculationService.suspend(0, yyyymmdd.month - 2);
  }
}
