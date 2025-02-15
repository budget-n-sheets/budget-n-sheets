/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class TriggersService {
  static installOnEdit_ () {
    ScriptApp.newTrigger('onEditHandler_')
      .forSpreadsheet(SpreadsheetApp2.getActive().getId())
      .onEdit()
      .create()
  }

  static installOnOpen_ () {
    ScriptApp.newTrigger('onOpenHandler_')
      .forSpreadsheet(SpreadsheetApp2.getActive().getId())
      .onOpen()
      .create()
  }

  static installTimeBased_ () {
    const yyyy = LocaleUtils.getDate().getFullYear()
    const hour = 0
    const minute = Noise.randomInteger(60)

    const financial_year = SettingsConst.get('financial_year')
    const timezone = SpreadsheetApp2.getActive().spreadsheet.getSpreadsheetTimeZone() || 'GMT'

    if (yyyy < financial_year) {
      const weekday = [ScriptApp.WeekDay.SUNDAY, ScriptApp.WeekDay.MONDAY, ScriptApp.WeekDay.TUESDAY, ScriptApp.WeekDay.WEDNESDAY, ScriptApp.WeekDay.THURSDAY, ScriptApp.WeekDay.FRIDAY, ScriptApp.WeekDay.SATURDAY]
      const day = new Date(financial_year, 0, 1).getDay()

      ScriptApp.newTrigger('weeklyHandler_')
        .timeBased()
        .atHour(hour)
        .nearMinute(minute)
        .everyWeeks(1)
        .onWeekDay(weekday[day])
        .inTimezone(timezone)
        .create()
    } else if (yyyy === financial_year) {
      ScriptApp.newTrigger('dailyHandler_')
        .timeBased()
        .atHour(hour)
        .nearMinute(minute)
        .everyDays(1)
        .inTimezone(timezone)
        .create()
    } else {
      const day = 1 + Noise.randomInteger(28)

      ScriptApp.newTrigger('monthlyHandler_')
        .timeBased()
        .atHour(hour)
        .nearMinute(minute)
        .onMonthDay(day)
        .inTimezone(timezone)
        .create()
    }
  }

  static restart () {
    this.stop()
    this.start()
  }

  static start () {
    this.installOnOpen_()
    this.installTimeBased_()
  }

  static stop () {
    Triggers.deleteAllUserTriggers()
  }
}
