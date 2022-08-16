class Triggers {
  static get triggers () {
    return ScriptApp.getUserTriggers(SpreadsheetApp2.getActive());
  }

  static deleteAllUserTriggers () {
    this.triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  }

  static deleteTriggerByEventType (eventType) {
    this.triggers.forEach(trigger => {
      if (trigger.getEventType() === eventType) ScriptApp.deleteTrigger(trigger);
    });
  }
}
