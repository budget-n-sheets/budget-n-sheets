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
  if (!Addon.isAuthorized(e)) return

  try {
    Addon.loadCache()
  } catch (err) {
    LogLog.error(err)
  }
}

function onEditHandler_ (e) {
  if (!Addon.isAuthorized(e)) return
}

function dailyHandler_ (e) {
  TriggersHandler.dailyTime(e)
}

function weeklyHandler_ (e) {
  TriggersHandler.weeklyTime(e)
}

function monthlyHandler_ (e) {
  TriggersHandler.monthlyTime(e)
}
