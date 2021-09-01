class LogLog {
  static error (err) {
    console.error(err.message + err.stack);
  }

  static warn (err) {
    console.warn(err.message + err.stack);
  }
}
