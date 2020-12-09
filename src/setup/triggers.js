function setupTriggers_(yyyy_mm) {
  var trigger, handler, type, parameters, day

  const hour = 2 + randomInteger(4)
  const financial_year = SETUP_SETTINGS["financial_year"]

  trigger = createNewTrigger_('onEditInstallable_', 'onEdit')
  saveTriggerId_(trigger)

  trigger = createNewTrigger_('onOpenInstallable_', 'onOpen')
  saveTriggerId_(trigger)

  if (financial_year < yyyy_mm.yyyy) {
    day = 1 + randomInteger(28)
    handler = 'weeklyTriggerPos_'
    type = 'onMonthDay'
    parameters = { days: day, hour: hour, minute: -1 }
  } else if (financial_year === yyyy_mm.yyyy) {
    handler = 'dailyTrigger_'
    type = 'everyDays'
    parameters = { days: 1, hour: hour, minute: -1 }
  } else if (financial_year > yyyy_mm.yyyy) {
    day = new Date(financial_year, 0, 2)
    day = day.getDay()

    handler = 'weeklyTriggerPre_'
    type = 'onWeekDay'
    parameters = { weeks: 1, week: day, hour: hour, minute: -1 }
  }

  trigger = createNewTrigger_(handler, type, parameters)
  saveTriggerId_(trigger)
}
