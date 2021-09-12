class Calendar {
  static getAllCalendars () {
    try {
      return CalendarApp.getAllCalendars();
    } catch (err) {
      LogLog.error(err);
    }

    try {
      return CalendarApp.getAllOwnedCalendars();
    } catch (err) {
      LogLog.error(err);
    }

    return [];
  }

  static getFinancialCalendar () {
    const id = SettingsUser.getValueOf('financial_calendar');
    return id ? CalendarApp.getCalendarById(id) : null;
  }

  static getUpcomingMonthEvents (mm) {
    const calendar = Calendar.getFinancialCalendar();
    if (!calendar) return [];

    const financial_year = SettingsConst.getValueOf('financial_year');

    const end = new Date(financial_year, mm + 1, 1);
    if (end <= Consts.date) return [];

    let start = new Date(financial_year, mm, 1);
    if (start <= Consts.date) {
      start = new Date(financial_year, mm, Consts.date.getDate() + 1);
      if (start > end) return [];
    }

    const offset = Utils.getDateOffset();
    const a = new Date(start + offset);
    const b = new Date(end + offset);

    return calendar.getEvents(a, b);
  }

  static isEnabled () {
    return this.getAllCalendars().length !== 0;
  }

  static listAllCalendars () {
    const cal = {};

    this.getAllCalendars().forEach(calendar => {
      const id = calendar.getId();
      const sha1 = Utilities2.computeDigest('SHA_1', id, 'UTF_8').substring(0, 12);

      cal[sha1] = {
        id: id,
        name: calendar.getName(),
        isOwner: calendar.isOwnedByMe()
      };
    });

    return cal;
  }
}
