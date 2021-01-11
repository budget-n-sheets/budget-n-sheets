function calendarDigestListEvents_ (listEvents, start, end, offset) {
  let evento, description;
  let translation, match;
  let list, cell, s, i, j;
  let startDate, endDate, a, d;

  const end2 = new Date(end);
  end2.setDate(end2.getDate() - 1);

  const output = [];
  const regexp = {
    accounts: '',
    cards: 0
  };

  const dec_p = getSpreadsheetSettings_('decimal_places');
  const dec_s = getSpreadsheetSettings_('decimal_separator');
  const number_format = '-?\\$\\d+' + (dec_p > 0 ? (dec_s ? '\\.' : ',') + '\\d{' + dec_p + '}' : '');
  const valueRegExp = new RegExp(number_format);

  const db_tables = getDbTables_();

  const list_acc = db_tables.accounts.names;
  list_acc.splice(0, 0, 'Wallet');

  list = list_acc.slice();
  list.sort(function (a, b) {
    return b.length - a.length;
  });

  s = list.join('|');
  s = '(' + s + ')';

  regexp.accounts = new RegExp(s, 'g');

  if (db_tables.cards.count > 0) {
    list = db_tables.cards.codes.slice();

    list.sort(function (a, b) {
      return b.length - a.length;
    });

    s = list.join('|');
    s = '(' + s + ')';

    regexp.cards = new RegExp(s, 'g');
  }

  for (i = 0; i < listEvents.length; i++) {
    evento = listEvents[i];

    description = evento.getDescription();
    if (description === '') continue;

    cell = {
      Id: evento.getId(),
      Day: [],
      Title: evento.getTitle(),
      Description: description,
      Table: -1,
      Card: -1,
      Value: 0,
      TranslationType: '',
      TranslationNumber: 0,
      Tags: [],
      TagImportant: '',
      hasAtMute: true,
      hasQcc: false,
      isRecurring: evento.isRecurringEvent()
    };

    match = cell.Description.match(regexp.accounts);
    if (match) {
      cell.Table = list_acc.indexOf(match[0]);
    }

    if (db_tables.cards.count > 0) {
      match = cell.Description.match(regexp.cards);
      if (match) {
        cell.Card = match[0];
      }
    }

    if (cell.Table === -1 && cell.Card === -1) continue;

    cell.hasAtMute = /@mute/.test(cell.Description);
    cell.hasQcc = /#qcc/.test(cell.Description);

    cell.Value = cell.Description.match(valueRegExp);
    if (!dec_s && cell.Value) cell.Value[0] = cell.Value[0].replace(',', '.');

    if (cell.Value) cell.Value = Number(cell.Value[0].replace('$', ''));
    else cell.Value = NaN;

    translation = getTranslation.call(cell.Description);
    cell.TranslationType = translation.type;
    cell.TranslationNumber = translation.number;

    match = cell.Description.match(/!#\w+/);
    cell.TagImportant = (match ? match[0].slice(2) : '');

    cell.Tags = cell.Description.match(/#\w+/g);
    if (!cell.Tags) cell.Tags = [];
    else {
      for (j = 0; j < cell.Tags.length; j++) {
        cell.Tags[j] = cell.Tags[j].slice(1);
      }
    }

    if (evento.isAllDayEvent()) {
      startDate = evento.getAllDayStartDate();
      endDate = evento.getAllDayEndDate();
      a = 0;
    } else {
      startDate = evento.getStartTime().getTime() - offset;
      endDate = evento.getEndTime().getTime() - offset;
      startDate = new Date(startDate);
      endDate = new Date(endDate);
      a = 1;
    }

    if (startDate < start) startDate = start;
    if (endDate >= end) {
      endDate = end2;
      a = 1;
    }

    startDate = startDate.getDate();
    endDate = endDate.getDate() + a;

    j = 0;
    for (d = startDate; d < endDate; d++) {
      cell.Day[j] = d;
      j++;
    }

    output.push(cell);
  }

  return output;
}

function getAllOwnedCalendars () {
  let calendars;
  let digest, id, name, i;

  try {
    calendars = CalendarApp.getAllCalendars();
  } catch (err) {
    ConsoleLog.error(err);
    calendars = [];
  }

  try {
    if (calendars.length === 0) {
      calendars = CalendarApp.getAllOwnedCalendars();
    }
  } catch (err) {
    ConsoleLog.error(err);
    calendars = [];
  }

  const db_calendars = {
    name: [],
    id: [],
    md5: []
  };

  for (i = 0; i < calendars.length; i++) {
    id = calendars[i].getId();
    digest = computeDigest('MD5', id, 'UTF_8');
    digest = digest.substring(0, 12);

    name = calendars[i].getName();
    if (!calendars[i].isOwnedByMe()) name += ' *';

    db_calendars.name[i] = name;
    db_calendars.id[i] = id;
    db_calendars.md5[i] = digest;
  }

  return db_calendars;
}

function getFinancialCalendar_ () {
  const financial_calendar = getUserSettings_('financial_calendar');
  if (!financial_calendar) return;
  return CalendarApp.getCalendarById(financial_calendar);
}

function getCalendarEventsForCashFlow_ (financial_year, mm) {
  let eventos;
  let today;
  let start, offset;

  if (!getUserSettings_('cash_flow_events')) return [];

  const calendar = getFinancialCalendar_();
  if (!calendar) return [];

  const end = new Date(financial_year, mm + 1, 1);
  if (DATE_NOW >= end) return [];

  start = new Date(financial_year, mm, 1);
  if (start <= DATE_NOW) {
    start = new Date(financial_year, mm, DATE_NOW.getDate() + 1);
    if (start > end) return [];
  }

  offset = getSpreadsheetDate(start);
  offset = start.getTime() - offset.getTime();

  const a = new Date(start.getTime() + offset);
  const b = new Date(end.getTime() + offset);

  eventos = calendar.getEvents(a, b);
  if (!eventos) return [];

  eventos = calendarDigestListEvents_(eventos, start, end, offset);
  return eventos;
}
