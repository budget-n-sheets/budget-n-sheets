class RecalculationService {
  static suspend (start, end) {
    new SuspendRecalculation().suspend(start, end);
  }

  static resume (start, end) {
    new ResumeRecalculation().resume(start, end);
  }
}
