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

  if(key !== "") {
    switch(method) {
      case 'document':
        m_Properties = PropertiesService.getDocumentProperties();
        break;
      case 'script':
        m_Properties = PropertiesService.getScriptProperties();
        break;
      case 'user':
      default:
        m_Properties = PropertiesService.getUserProperties();
        break;
    }
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

  if(key !== "") {
    m_Properties.setProperty(key, thisTrigger.getUniqueId());
  }
}

/**
 * Deletes a trigger of id stored in a given key of property store.
 * @param  {String} method The method to get a property store
 * @param  {String} key    The key for the property
 * @param  {String} name   The name of the function
 */
function deleteScriptAppTriggers_(method, key, name) {
  var m_Properties;
  var listTriggers, thisTrigger, thisTriggerID;
  var i;


  switch(method) {
    case 'document':
      m_Properties = PropertiesService.getDocumentProperties();
      break;
    case 'script':
      m_Properties = PropertiesService.getScriptProperties();
      break;
    case 'user':
    default:
      m_Properties = PropertiesService.getUserProperties();
      break;
  }

  listTriggers = ScriptApp.getUserTriggers( SpreadsheetApp.getActiveSpreadsheet() );

  if(key) {
    thisTriggerID = m_Properties.getProperty(key);
    if(!thisTriggerID) return;

    for(i = 0;  i < listTriggers.length;  i++) {
      if(listTriggers[i].getUniqueId() === thisTriggerID) {
        ScriptApp.deleteTrigger(listTriggers[i]);
        m_Properties.deleteProperty(key);
        break;
      }
    }
  } else {
    for(i = 0;  i < listTriggers.length;  i++) {
      if(listTriggers[i].getHandlerFunction() === name) {
        ScriptApp.deleteTrigger(listTriggers[i]);
        break;
      }
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
