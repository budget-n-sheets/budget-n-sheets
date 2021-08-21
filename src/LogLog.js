class LogLog {
  static error (err) {
    console.error(err.message + '\n' + err.stack);
  }

  static warn (err) {
    console.warn(err.message + '\n' + err.stack);
  }
}
