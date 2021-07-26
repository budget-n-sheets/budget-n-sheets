function startTrigger_ (name) {
  if (name === 'onOpen') {
    const trigger = createNewTrigger_('onOpenInstallable_', 'onOpen');
    saveTriggerId_(trigger);
  } else if (name === 'onEdit') {
    const trigger = createNewTrigger_('onEditInstallable_', 'onEdit');
    saveTriggerId_(trigger);
  } else if (name === 'timeBased') {
    let handler, type, parameters;

    const hour = 2 + randomInteger(4);
    const yyyy = Utils.getLocaleDate().getFullYear();
    const financial_year = getConstProperties_('financial_year');

    if (yyyy < financial_year) {
      const day = new Date(financial_year, 0, 1).getDay();

      handler = 'weeklyTriggerPre_';
      type = 'onWeekDay';
      parameters = { weeks: 1, week: day, hour: hour, minute: -1 };
    } else if (financial_year === yyyy) {
      handler = 'dailyTrigger_';
      type = 'everyDays';
      parameters = { days: 1, hour: hour, minute: -1 };
    } else {
      const day = 1 + randomInteger(28);

      handler = 'weeklyTriggerPos_';
      type = 'onMonthDay';
      parameters = { days: day, hour: hour, minute: -1 };
    }

    const trigger = createNewTrigger_(handler, type, parameters);
    saveTriggerId_(trigger);
  }
}

function stopTrigger_ (name) {
  let select;

  switch (name) {
    case 'onOpen':
      select = 'ON_OPEN';
      break;
    case 'onEdit':
      select = 'ON_EDIT';
      break;
    case 'timeBased':
      select = 'CLOCK';
      break;

    default:
      throw new Error('stopTrigger_(): Invalid trigger type. ' + name);
  }

  deleteTrigger_('EventType', select);
}
