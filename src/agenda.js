function calendarDigestListEvents_ (eventos, start, end, offset) {
  let startDate, endDate;
  let match, list;
  let a, s;

  const end2 = new Date(end);
  end2.setDate(end2.getDate() - 1);

  const output = [];
  const regexp = {
    accounts: '',
    cards: 0
  };

  const dec_p = SettingsSpreadsheet.getValueOf('decimal_places');
  const dec_s = SettingsSpreadsheet.getValueOf('decimal_separator');
  const number_format = '-?\\$\\d+' + (dec_p > 0 ? (dec_s ? '\\.' : ',') + '\\d{' + dec_p + '}' : '');
  const valueRegExp = new RegExp(number_format);

  const db_accounts = new AccountsService().getAll();
  const cardsService = new CardsService();

  const list_acc = ['Wallet'];
  for (const id in db_accounts) {
    list_acc.push(db_accounts[id].name);
  }

  list = list_acc.slice();
  list.sort(function (a, b) {
    return b.length - a.length;
  });

  s = list.join('|');
  s = '(' + s + ')';

  regexp.accounts = new RegExp(s, 'g');

  if (cardsService.hasCards()) {
    const db_cards = cardsService.getAll();

    list = [];
    for (const id in db_cards) {
      list.push(db_cards[id].code);
    }

    list.sort(function (a, b) {
      return b.length - a.length;
    });

    s = list.join('|');
    s = '(' + s + ')';

    regexp.cards = new RegExp(s, 'g');
  }

  for (let i = 0; i < eventos.length; i++) {
    const evento = eventos[i];

    const description = evento.getDescription();
    if (description === '') continue;

    const cell = {
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
    if (match) cell.Table = list_acc.indexOf(match[0]);

    if (cardsService.hasCards()) {
      const match = cell.Description.match(regexp.cards);
      if (match) cell.Card = match[0];
    }

    if (cell.Table === -1 && cell.Card === -1) continue;

    cell.hasAtMute = /@mute/.test(cell.Description);
    cell.hasQcc = /#qcc/.test(cell.Description);

    cell.Value = cell.Description.match(valueRegExp);
    if (!dec_s && cell.Value) cell.Value[0] = cell.Value[0].replace(',', '.');

    if (cell.Value) cell.Value = Number(cell.Value[0].replace('$', ''));
    else cell.Value = NaN;

    const translation = Utils.getTranslation(cell.Description);
    cell.TranslationType = translation.type;
    cell.TranslationNumber = translation.number;
    cell.TranslationSignal = translation.signal;

    match = cell.Description.match(/!#\w+/);
    if (match) cell.TagImportant = match[0].slice(2);

    cell.Tags = cell.Description.match(/#\w+/g);
    if (!cell.Tags) cell.Tags = [];
    else {
      for (let j = 0; j < cell.Tags.length; j++) {
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

    for (let day = startDate; day < endDate; day++) {
      cell.Day.push(day);
    }

    output.push(cell);
  }

  return output;
}

function getAllOwnedCalendars () {
  let calendars;

  try {
    calendars = CalendarApp.getAllCalendars();
  } catch (err) {
    LogLog.error(err);
    calendars = [];
  }

  try {
    if (calendars.length === 0) {
      calendars = CalendarApp.getAllOwnedCalendars();
    }
  } catch (err) {
    LogLog.error(err);
    calendars = [];
  }

  const db_calendars = {
    name: [],
    id: [],
    md5: []
  };

  for (let i = 0; i < calendars.length; i++) {
    const id = calendars[i].getId();

    let digest = Utilities2.computeDigest('MD5', id, 'UTF_8');
    digest = digest.substring(0, 12);

    let name = calendars[i].getName();
    if (!calendars[i].isOwnedByMe()) name += ' *';

    db_calendars.name[i] = name;
    db_calendars.id[i] = id;
    db_calendars.md5[i] = digest;
  }

  return db_calendars;
}

function getFinancialCalendar_ () {
  const financial_calendar = SettingsUser.getValueOf('financial_calendar');
  if (!financial_calendar) return 0;
  return CalendarApp.getCalendarById(financial_calendar);
}

function getCalendarEventsForCashFlow_ (financial_year, mm) {
  if (!SettingsUser.getValueOf('cash_flow_events')) return [];

  const calendar = Calendar.getFinancialCalendar();
  if (!calendar) return [];

  const end = new Date(financial_year, mm + 1, 1);
  if (Consts.date >= end) return [];

  let start = new Date(financial_year, mm, 1);
  if (start <= Consts.date) {
    start = new Date(financial_year, mm, Consts.date.getDate() + 1);
    if (start > end) return [];
  }

  let offset = Utils.getLocaleDate(start);
  offset = start.getTime() - offset.getTime();

  const a = new Date(start.getTime() + offset);
  const b = new Date(end.getTime() + offset);

  const eventos = calendar.getEvents(a, b);
  if (!eventos) return [];

  return calendarDigestListEvents_(eventos, start, end, offset);
}
