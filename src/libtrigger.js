/**
 * Copyright (c) 2019 Guilherme T Maeoka
 * This code is licensed under MIT license.
 * <https://github.com/guimspace/gas-common>
 */

/**
 * Creates a trigger and store the id in a key of property store.
 * @param  {String} method The method to get a property store
 * @param  {String} key    The key for the property
 * @param  {String} type   The type of the trigger
 * @param  {String} name   The function to call when the trigger fires
 */
function createScriptAppTriggers_(method, key, type, name, param1, param2, param3) {
  var enum_weekday = [ ScriptApp.WeekDay.SUNDAY, ScriptApp.WeekDay.MONDAY, ScriptApp.WeekDay.TUESDAY, ScriptApp.WeekDay.WEDNESDAY, ScriptApp.WeekDay.THURSDAY, ScriptApp.WeekDay.FRIDAY, ScriptApp.WeekDay.SATURDAY ];
  var m_Properties;
  var thisTrigger;

  switch(method) {
    case 'document':
      m_Properties = documentPropertiesService_;
      break;
    case 'script':
      m_Properties = scriptPropertiesService_;
      break;
    case 'user':
    default:
      m_Properties = userPropertiesService_;
      break;
  }

  if(type === 'onOpen') {
    thisTrigger = ScriptApp.newTrigger(name)
      .forSpreadsheet( SpreadsheetApp.getActiveSpreadsheet().getId() )
      .onOpen()
      .create();
  } else if(type === 'afterMilliseconds') {
    thisTrigger = ScriptApp.newTrigger(name)
      .timeBased()
      .after(param1)
      .inTimezone( SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone() )
      .create();
  } else if(type === 'atDate') {
    thisTrigger = ScriptApp.newTrigger(name)
      .timeBased()
      .atDate(param1, param2, param3)
      .inTimezone( SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone() )
      .create();
  } else if(type === 'onMonthDay') {
    if(param2 == null)  param2 = 0;

    thisTrigger = ScriptApp.newTrigger(name)
      .timeBased()
      .onMonthDay(param1)
      .atHour(param2)
      .inTimezone( SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone() )
      .create();
  } else if(type === 'onWeekDay') {
    if(param2 == null)  param2 = 0;

    thisTrigger = ScriptApp.newTrigger(name)
      .timeBased()
      .onWeekDay(enum_weekday[param1])
      .atHour(param2)
      .inTimezone( SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone() )
      .create();
  } else if(type === 'everyMinutes') {
    thisTrigger = ScriptApp.newTrigger(name)
      .timeBased()
      .everyMinutes(param1)
      .inTimezone( SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone() )
      .create();
  } else if(type === 'everyHours') {
    thisTrigger = ScriptApp.newTrigger(name)
      .timeBased()
      .everyHours(param1)
      .inTimezone( SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone() )
      .create();
  } else if(type === 'everyDays') {
    if(param2 == null)  param2 = 0;

    thisTrigger = ScriptApp.newTrigger(name)
      .timeBased()
      .everyDays(param1)
      .atHour(param2)
      .inTimezone( SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone() )
      .create();
  } else if(type === 'everyWeeks') {
    thisTrigger = ScriptApp.newTrigger(name)
      .timeBased()
      .everyWeeks(param1)
      .inTimezone( SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone() )
      .create();
  } else if(type === 'onEdit') {
    thisTrigger = ScriptApp.newTrigger(name)
      .forSpreadsheet( SpreadsheetApp.getActiveSpreadsheet().getId() )
      .onEdit()
      .create();
  } else if(type === 'onChange') {
    thisTrigger = ScriptApp.newTrigger(name)
      .forSpreadsheet( SpreadsheetApp.getActiveSpreadsheet().getId() )
      .onChange()
      .create();
  } else if(type === 'onFormSubmit') {
    thisTrigger = ScriptApp.newTrigger(name)
      .forSpreadsheet( SpreadsheetApp.getActiveSpreadsheet().getId() )
      .onFormSubmit()
      .create();
  }

  m_Properties.setProperty(key, thisTrigger.getUniqueId());
}

/**
 * Deletes a trigger of id stored in a given key of property store.
 * @param  {String} method The method to get a property store
 * @param  {String} key    The key for the property
 */
function deleteScriptAppTriggers_(method, key) {
  var m_Properties;
  var listTriggers, thisTrigger, thisTriggerID;
  var i;


  switch(method) {
    case 'document':
      m_Properties = documentPropertiesService_;
      break;
    case 'script':
      m_Properties = scriptPropertiesService_;
      break;
    case 'user':
    default:
      m_Properties = userPropertiesService_;
      break;
  }

  thisTriggerID = m_Properties.getProperty(key);
  if(thisTriggerID == null) return;

  listTriggers = ScriptApp.getUserTriggers( SpreadsheetApp.getActiveSpreadsheet() );

  for(i = 0;  i < listTriggers.length;  i++) {
    if(listTriggers[i].getUniqueId() === thisTriggerID) {
      ScriptApp.deleteTrigger(listTriggers[i]);
      m_Properties.setProperty(key, '');
      break;
    }
  }
}

/**
 * Purges all triggers.
 */
function purgeScriptAppTriggers_() {
  var listTriggers = ScriptApp.getUserTriggers( SpreadsheetApp.getActiveSpreadsheet() );
  var i;


  for(i = 0;  i < listTriggers.length;  i++) {
    ScriptApp.deleteTrigger(listTriggers[i]);
    Utilities.sleep(487);
  }
}
