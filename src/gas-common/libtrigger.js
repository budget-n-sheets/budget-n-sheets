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

function saveTriggerId_ (trigger, scope, key) {
  PropertiesService2.setProperty(scope, key, 'string', trigger.getUniqueId())
}

/**
 * Creates a trigger and store the id in a key of property store.
 * @param  {String} name   The function to call when the trigger fires
 * @param  {String} type   The type of the trigger
 * @return {Trigger}       Return the trigger created
 */
function createNewTrigger_ (name, type, param) {
  const weekday = [ScriptApp.WeekDay.SUNDAY, ScriptApp.WeekDay.MONDAY, ScriptApp.WeekDay.TUESDAY, ScriptApp.WeekDay.WEDNESDAY, ScriptApp.WeekDay.THURSDAY, ScriptApp.WeekDay.FRIDAY, ScriptApp.WeekDay.SATURDAY]

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  var trigger = ScriptApp.newTrigger(name)

  switch (type) {
    case 'onOpen':
    case 'onEdit':
    case 'onChange':
    case 'onFormSubmit':
      return trigger.forSpreadsheet(spreadsheet.getId())[type]().create()
  }

  var weeks, week, hour, minute
  trigger = trigger.timeBased()

  if (type === 'atDate') {
    trigger.atDate(param.year, param.month, param.day)
  } else if (['after', 'at', 'everyMinutes'].indexOf(type) !== -1) {
    trigger[type](param)
  } else {
    if (param.hour == null) hour = 0
    else if (param.hour === -1) hour = randomInteger(24)
    else hour = param.hour

    if (param.minute == null) minute = 0
    else if (param.minute === -1) minute = randomInteger(60)
    else minute = param.minute

    switch (type) {
      case 'everyHours':
        trigger.nearMinute(minute).everyHours(param.hours)
        break
      case 'everyWeeks':
      case 'onWeekDay':
        if (param.weeks == null) weeks = 1
        else weeks = param.weeks

        if (param.week == null) week = 0
        else if (param.week === -1) week = randomInteger(7)
        else week = param.week

        trigger.atHour(hour).nearMinute(minute).everyWeeks(weeks).onWeekDay(weekday[week])
        break
      case 'onMonthDay':
      case 'everyDays':
        trigger.atHour(hour).nearMinute(minute)
        trigger[type](param.days)
        break

      default:
        throw new Error('Invalid trigger type.')
    }
  }

  var timezone = spreadsheet.getSpreadsheetTimeZone()
  if (!timezone) timezone = 'GMT'

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

  var triggers = ScriptApp.getProjectTriggers()

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
  var triggers = ScriptApp.getProjectTriggers()

  const ids = [
    PropertiesService2.getProperty('document', 'onOpenTriggerId', 'string'),
    PropertiesService2.getProperty('document', 'onEditTriggerId', 'string'),
    PropertiesService2.getProperty('document', 'clockTriggerId', 'string')
  ]

  for (var i = 0; i < triggers.length; i++) {
    if (ids.indexOf(triggers[i].getUniqueId()) !== -1) {
      ScriptApp.deleteTrigger(triggers[i])
    }
  }
}

/**
 * Purges all triggers.
 */
function deleteAllProjectTriggers_ () {
  var triggers = ScriptApp.getProjectTriggers()

  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i])
  }
}

function countProjectTriggers () {
  return ScriptApp.getProjectTriggers().length
}
