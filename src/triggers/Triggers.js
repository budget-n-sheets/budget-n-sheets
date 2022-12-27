/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class Triggers {
  static get triggers () {
    return ScriptApp.getUserTriggers(SpreadsheetApp2.getActive().spreadsheet);
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
