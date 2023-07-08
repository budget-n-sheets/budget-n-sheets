/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

function onOpenHandler_ (e) {
  if (!Addon.isAuthorized(e)) return;

  try {
    Addon.loadCache();
  } catch (err) {
    LogLog.error(err);
  }
}

function onEditHandler_ (e) {
  if (!Addon.isAuthorized(e)) return;
}

function weeklyHandler_ (e) {
  if (!Addon.isAuthorized(e)) return;
  if (!AddonUser.hasBaselinePermission()) return
  if (UpdateService.checkAndUpdate()) return;

  const financial_year = SettingsConst.get('financial_year');
  if (e.year > financial_year) return;

  treatLayout_(e.year, e.month - 1);
  TriggersService.restart();
}

function dailyHandler_ (e) {
  if (!Addon.isAuthorized(e)) return;
  if (!AddonUser.hasBaselinePermission()) return
  if (UpdateService.checkAndUpdate()) return;

  const financial_year = SettingsConst.get('financial_year');

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

  if (SettingsUser.get('post_day_events')) {
    const date = Utils.getLocaleDate();
    CalendarService.syncDayWithSpreadsheet(date);
  }
}

function monthlyHandler_ (e) {
  if (!Addon.isAuthorized(e)) return;
  if (!AddonUser.hasBaselinePermission()) return
  if (UpdateService.checkAndUpdate()) return;
}
