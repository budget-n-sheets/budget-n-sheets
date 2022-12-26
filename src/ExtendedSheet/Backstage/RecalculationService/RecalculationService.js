/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class RecalculationService {
  static suspend (start, end) {
    new SuspendRecalculation().suspend(start, end);
  }

  static resume (start, end) {
    new ResumeRecalculation().resume(start, end);
  }
}
