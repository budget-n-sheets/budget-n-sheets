/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class TriggersHandler {
  static baseRoutine_ (authMode) {
    if (!Addon.isAuthorized(authMode)) return false
    if (!AddonUser.hasBaselinePermission()) return false
    if (UpdateService.checkAndUpdate()) return false
    return true
  }

  static dailyTime (e) {
    if (!this.baseRoutine_(e.authMode)) return

    const financialYear = SettingsConst.get('financial_year')
    if (e.year > financialYear) {
      TriggersService.restart()
      BnsMaintenance.fixSpreadsheet()
      return
    }

    if (e['day-of-month'] === 1) {
      BnsMaintenance.fixSpreadsheet()
    }

    if (SettingsUser.get('post_day_events')) {
      const date = LocaleUtils.getDate()
      CalendarService.syncDayWithSpreadsheet(date)
    }
  }

  static weeklyTime (e) {
    if (!this.baseRoutine_(e.authMode)) return

    const financialYear = SettingsConst.get('financial_year')
    if (e.year < financialYear) return

    TriggersService.restart()
    BnsMaintenance.fixSpreadsheet()
  }

  static monthlyTime (e) {
    this.baseRoutine_(e.authMode)
  }
}
