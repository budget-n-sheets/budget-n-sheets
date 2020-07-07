/**
 * Copyright (c) 2019 Guilherme T Maeoka
 * This code is licensed under MIT license.
 * <https://github.com/guimspace/gas-common>
 */

function getEventType (v) {
  switch (v) {
    case 'CLOCK':
      return ScriptApp.EventType.CLOCK
    case 'ON_OPEN':
      return ScriptApp.EventType.ON_OPEN
    case 'ON_EDIT':
      return ScriptApp.EventType.ON_EDIT
    case 'ON_FORM_SUBMIT':
      return ScriptApp.EventType.ON_FORM_SUBMIT
    case 'ON_CHANGE':
      return ScriptApp.EventType.ON_CHANGE
    case 'ON_EVENT_UPDATED':
      return ScriptApp.EventType.ON_EVENT_UPDATED
  }
}

function saveTriggerId (trigger, scope, key) {
  PropertiesService2.setProperty('document', key, 'string', trigger.getUniqueId())
}

/**
 * Creates a trigger and store the id in a key of property store.
 * @param  {String} type   The type of the trigger
 * @param  {String} name   The function to call when the trigger fires
 * @return {Trigger}       Return the trigger created
 */
function createNewTrigger_ (type, name, param1, param2, param3) {
  const weekday = [ScriptApp.WeekDay.SUNDAY, ScriptApp.WeekDay.MONDAY, ScriptApp.WeekDay.TUESDAY, ScriptApp.WeekDay.WEDNESDAY, ScriptApp.WeekDay.THURSDAY, ScriptApp.WeekDay.FRIDAY, ScriptApp.WeekDay.SATURDAY]

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  var timezone = spreadsheet.getSpreadsheetTimeZone()
  if (!timezone) timezone = 'GMT'

  var trigger = ScriptApp.newTrigger(name)

  switch (type) {
    case 'onOpen':
    case 'onEdit':
    case 'onChange':
    case 'onFormSubmit':
      return trigger.forSpreadsheet(spreadsheet.getId())[type]().create()
  }

  trigger = trigger.timeBased()

  switch (type) {
    case 'afterMilliseconds':
      trigger.after(param1)
      break
    case 'atTime':
      trigger.at(param1)
      break
    case 'atDate':
      trigger.atDate(param1, param2, param3)
      break
    case 'onWeekDay':
      trigger.onWeekDay(weekday[param1])
      break
    case 'everyWeeks':
      trigger.onWeekDay(weekday[param2])
    case 'everyHours':
    case 'onMonthDay':
    case 'everyDays':
      if (param2 == null) param2 = 0
      else if (param2 === -1) param2 = randomInteger(24)

      if (param3 == null) param3 = 0
      else if (param3 === -1) param3 = randomInteger(60)

      trigger.atHour(param2).nearMinute(param3)
    case 'everyMinutes':
      trigger[type](param1)
      break

    default:
      throw new Error('Invalid trigger type.')
  }

  return trigger.inTimezone(timezone).create()
}

/**
 * Delete a trigger of category and tested value.
 * @param  {String} category   The category of search
 * @param  {String} select     The selected value
 * @param  {Boolean} onlyFirst Delete all or only first trigger
 * @return {Number}            Number of triggers deleted
 */
function deleteTrigger_ (category, select, onlyFirst) {
  var method = 'get' + category
  var n = 0
  var watch

  switch (category) {
    case 'EventType':
      watch = getEventType(select)
      break
    case 'KeyId':
      method = 'getUniqueId'
      watch = PropertiesService2.getProperty(select.scope, select.key, 'string')
      break
    case 'UniqueId':
    case 'HandlerFunction':
      watch = select
      break
  }

  var triggers = ScriptApp.getUserTriggers(SpreadsheetApp.getActiveSpreadsheet())

  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i][method]() === watch) {
      ScriptApp.deleteTrigger(triggers[i])
      n++
      if (onlyFirst) break
    }
  }

  return n
}

/**
 * Purges all triggers.
 */
function deleteAllTriggers_ () {
  var triggers = ScriptApp.getUserTriggers(SpreadsheetApp.getActiveSpreadsheet())

  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i])
  }
}
