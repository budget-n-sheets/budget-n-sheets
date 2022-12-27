/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class FinCal {
  constructor () {
    this.id = SettingsUser.get('financial_calendar');
    this.calendar = CalendarApp.getCalendarById(this.id);
    if (!this.calendar) return this;

    this.isOwner = this.calendar.isOwnedByMe();

    this.dateOffset = Utils.getDateOffset();
    this.fin_year = SettingsConst.get('financial_year');
  }

  get dateoffset () {
    return this.dateOffset;
  }

  set dateoffset (offset) {
    this.dateOffset = offset;
  }

  getEventsForDay (date) {
    if (!this.calendar) return [];
    return this.calendar.getEventsForDay(date);
  }

  getUpcomingMonthEvents (mm) {
    if (!this.calendar) return [];
    if (mm == null) mm = Consts.date.getMonth();

    const end = new Date(this.fin_year, mm + 1, 1);
    if (end <= Consts.date) return [];

    let start = new Date(this.fin_year, mm, 1);
    if (start <= Consts.date) {
      start = new Date(this.fin_year, mm, Consts.date.getDate() + 1);
      if (start >= end) return [];
    }

    const a = new Date(start.getTime() - this.dateoffset);
    const b = new Date(end.getTime() - this.dateoffset);

    return this.calendar.getEvents(a, b);
  }
}
