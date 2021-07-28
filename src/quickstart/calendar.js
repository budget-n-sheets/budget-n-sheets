const QUICKSTART_DATA_CALENDAR = Object.freeze({
  1: [
    {
      day: 2,
      title: 'The simplest event',
      description: 'acc_name\nvalue\n---\nThis simple event has the name of an account and a number formatted.',
      value: -1.23
    },
    {
      day: 3,
      title: 'Muted event',
      description: 'acc_name\nvalue\n\n@muted\n---\nThis event has the "@muted" indicator, so it is not included in cash flow, nor posted in the table.',
      value: -1.23
    },
    {
      day: 5,
      title: 'Income',
      description: 'acc_name\nvalue\n\n#trf #rct\n---\nSimilar to <b>The simplest event</b> but with a few tags. While the tags don\'t play any role in cash flow, they are posted in the table along with the other details.',
      value: 1234.56
    }
  ],
  2: [
    {
      day: 2,
      title: 'The simplest card event',
      description: 'card_code\nvalue\n---\nThis simple event has the code of a card and a number formatted. This event is not synced with the cash flow.',
      value: -1.23
    },
    {
      day: 7,
      title: 'Card bill payment',
      description: 'card_code\n\n#qcc\n---\nThis event has the "#qcc" built-in tag and no number formatted. The add-on gets the card\'s balance of the previous month and puts it in the cash flow.'
    }
  ],
  3: [
    {
      day: 11,
      length: 2,
      title: 'Two-days event',
      description: 'acc_name\nvalue\n---\nMultiple-days events behave like a series of one-day event.',
      value: -1.23
    }
  ]
});

function playQuickCalendar_ (n) {
  const ui = SpreadsheetApp2.getUi();
  const calendar = getFinancialCalendar_();
  let data, value, description, mm, i;

  if (!calendar) {
    ui.alert(
      "Can't create events",
      'Select a financial calendar first in the settings.',
      ui.ButtonSet.OK);
    return;
  } else if (!calendar.isOwnedByMe()) {
    ui.alert(
      'Permission denied',
      'You are not the owner of the selected calendar.',
      ui.ButtonSet.OK);
    return;
  }

  const response = ui.alert(
    'Permission Required',
    'Allow add-on "Budget n Sheets" to create calendar events?',
    ui.ButtonSet.YES_NO);
  if (response === ui.Button.NO) return;

  const yyyy = DATE_NOW.getFullYear();
  const financial_year = SettingsConst.getValueOf('financial_year');

  if (yyyy === financial_year) {
    mm = DATE_NOW.getMonth() + 1;
  } else if (yyyy < financial_year) {
    mm = SettingsUser.getValueOf('initial_month');
  } else {
    return;
  }

  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('Cash Flow');

  if (!sheet) {
    alertQuickstartSheetMissing(name);
    return;
  }

  spreadsheet.setActiveSheet(sheet);

  const db_tables = getDbTables_();
  const acc_name = db_tables.accounts.names[0];
  const card_code = (db_tables.cards.count > 0 ? db_tables.cards.codes[0] : '');

  data = QUICKSTART_DATA_CALENDAR[1];
  if (!data) throw new Error("Values for quickstart example couldn't be found. calendar:" + n);

  for (i = 0; i < data.length; i++) {
    description = data[i].description;
    description = description.replace('acc_name', acc_name);

    if (data[i].value) {
      value = FormatNumber.calendarSignal(data[i].value);
      description = description.replace('value', value);
    }

    calendar.createAllDayEvent(
      data[i].title,
      new Date(financial_year, mm, data[i].day),
      { description: description }
    );
    Utilities.sleep(200);
  }

  if (card_code) {
    data = QUICKSTART_DATA_CALENDAR[2];
    if (!data) throw new Error("Values for quickstart example couldn't be found. calendar:" + n);

    for (i = 0; i < data.length; i++) {
      description = data[i].description;
      description = description.replace('card_code', card_code);

      if (data[i].value) {
        value = FormatNumber.calendarSignal(data[i].value);
        description = description.replace('value', value);
      }

      calendar.createAllDayEvent(
        data[i].title,
        new Date(financial_year, mm, data[i].day),
        { description: description }
      );
    }
  }

  data = QUICKSTART_DATA_CALENDAR[3];
  if (!data) throw new Error("Values for quickstart example couldn't be found. calendar:" + n);

  for (i = 0; i < data.length; i++) {
    description = data[i].description;
    description = description.replace('acc_name', acc_name);

    if (data[i].value) {
      value = FormatNumber.calendarSignal(data[i].value);
      description = description.replace('value', value);
    }

    calendar.createAllDayEvent(
      data[i].title,
      new Date(financial_year, mm, data[i].day),
      new Date(financial_year, mm, data[i].day + data[i].length),
      { description: description }
    );
  }

  SettingsUser.setValueOf('cash_flow_events', true);
  updateCashFlow_(mm);

  sheet.getRange(1, 2 + 4 * mm, 1, 3).activate();
}
