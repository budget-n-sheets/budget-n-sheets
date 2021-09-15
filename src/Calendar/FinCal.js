class FinCal {
  constructor () {
    this.id = SettingsUser.getValueOf('financial_calendar');
    this.calendar = CalendarApp.getCalendarById(this.id);
    if (!this.calendar) return this;

    this.isOwner = this.calendar.isOwnedByMe();

    this.dateOffset = Utils.getDateOffset();
    this.fin_year = SettingsConst.getValueOf('financial_year');
  }

  get dateoffset () {
    return this.dateOffset;
  }

  set dateoffset (offset) {
    return this.dateOffset = offset;
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
