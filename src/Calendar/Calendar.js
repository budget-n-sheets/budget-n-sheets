/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

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
