/**
 * Copyright (c) 2019 Guilherme T Maeoka
 * This code is licensed under MIT license.
 * <https://github.com/guimspace/gas-common>
 */

function getEventType (v) {
  switch (v) {
    case 'CLOCK':
      return ScriptApp.EventType.CLOCK;
    case 'ON_OPEN':
      return ScriptApp.EventType.ON_OPEN;
    case 'ON_EDIT':
      return ScriptApp.EventType.ON_EDIT;
    case 'ON_FORM_SUBMIT':
      return ScriptApp.EventType.ON_FORM_SUBMIT;
    case 'ON_CHANGE':
      return ScriptApp.EventType.ON_CHANGE;
    case 'ON_EVENT_UPDATED':
      return ScriptApp.EventType.ON_EVENT_UPDATED;
  }
}

function saveTriggerId_ (trigger) {
  let key;

  switch (trigger.getEventType()) {
    case ScriptApp.EventType.ON_OPEN:
      key = 'onOpen';
      break;
    case ScriptApp.EventType.ON_EDIT:
      key = 'onEdit';
      break;
    case ScriptApp.EventType.CLOCK:
      key = 'timeBased';
      break;
  }

  const spreadsheet_triggers = PropertiesService2.getProperty('document', 'spreadsheet_triggers', 'json');
  if (!spreadsheet_triggers) return;

  spreadsheet_triggers[key] = {
    id: trigger.getUniqueId(),
    time_created: DATE_NOW.getTime()
  };

  PropertiesService2.setProperty('document', 'spreadsheet_triggers', 'json', spreadsheet_triggers);
}

/**
 * Creates a trigger and store the id in a key of property store.
 * @param  {String} name   The function to call when the trigger fires
 * @param  {String} type   The type of the trigger
 * @return {Trigger}       Return the trigger created
 */
function createNewTrigger_ (name, type, param) {
  const weekday = [ScriptApp.WeekDay.SUNDAY, ScriptApp.WeekDay.MONDAY, ScriptApp.WeekDay.TUESDAY, ScriptApp.WeekDay.WEDNESDAY, ScriptApp.WeekDay.THURSDAY, ScriptApp.WeekDay.FRIDAY, ScriptApp.WeekDay.SATURDAY];

  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  let trigger = ScriptApp.newTrigger(name);

  switch (type) {
    case 'onOpen':
    case 'onEdit':
    case 'onChange':
    case 'onFormSubmit':
      return trigger.forSpreadsheet(spreadsheet.getId())[type]().create();
  }

  let weeks, week, hour, minute;
  trigger = trigger.timeBased();

  if (type === 'atDate') {
    trigger.atDate(param.year, param.month, param.day);
  } else if (['after', 'at', 'everyMinutes'].indexOf(type) !== -1) {
    trigger[type](param);
  } else {
    if (param.hour == null) hour = 0;
    else if (param.hour === -1) hour = randomInteger(24);
    else hour = param.hour;

    if (param.minute == null) minute = 0;
    else if (param.minute === -1) minute = randomInteger(60);
    else minute = param.minute;

    switch (type) {
      case 'everyHours':
        trigger.nearMinute(minute).everyHours(param.hours);
        break;
      case 'everyWeeks':
      case 'onWeekDay':
        if (param.weeks == null) weeks = 1;
        else weeks = param.weeks;

        if (param.week == null) week = 0;
        else if (param.week === -1) week = randomInteger(7);
        else week = param.week;

        trigger.atHour(hour).nearMinute(minute).everyWeeks(weeks).onWeekDay(weekday[week]);
        break;
      case 'onMonthDay':
      case 'everyDays':
        trigger.atHour(hour).nearMinute(minute);
        trigger[type](param.days);
        break;

      default:
        throw new Error('Invalid trigger type.');
    }
  }

  let timezone = spreadsheet.getSpreadsheetTimeZone();
  if (!timezone) timezone = 'GMT';

  return trigger.inTimezone(timezone).create();
}

/**
 * Delete a trigger of category and tested value.
 * @param  {String} category   The category of search
 * @param  {String} select     The selected value
 * @param  {Boolean} onlyFirst Delete all or only first trigger
 * @return {Number}            Number of triggers deleted
 */
function deleteTrigger_ (category, select, onlyFirst) {
  let method = 'get' + category;
  let n = 0;
  let watch;

  switch (category) {
    case 'EventType':
      watch = getEventType(select);
      break;
    case 'KeyId':
      method = 'getUniqueId';
      watch = PropertiesService2.getProperty(select.scope, select.key, 'string');
      break;
    case 'UniqueId':
    case 'HandlerFunction':
      watch = select;
      break;
  }

  const triggers = ScriptApp.getUserTriggers(SpreadsheetApp2.getActiveSpreadsheet());

  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i][method]() === watch) {
      ScriptApp.deleteTrigger(triggers[i]);
      n++;
      if (onlyFirst) break;
    }
  }

  return n;
}

/**
 * Purges all triggers.
 */
function deleteAllTriggers_ () {
  const triggers = ScriptApp.getUserTriggers(SpreadsheetApp2.getActiveSpreadsheet());

  for (let i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
}

/**
 * Purges all triggers.
 */
function deleteAllProjectTriggers_ () {
  const triggers = ScriptApp.getProjectTriggers();

  for (let i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
}

function countProjectTriggers () {
  return ScriptApp.getProjectTriggers().length;
}
