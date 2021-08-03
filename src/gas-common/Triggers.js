class Triggers {
  static deleteAllUserTriggers () {
    ScriptApp.getUserTriggers(SpreadsheetApp2.getActiveSpreadsheet()).forEach(
      trigger => ScriptApp.deleteTrigger(trigger)
    );
  }
}
